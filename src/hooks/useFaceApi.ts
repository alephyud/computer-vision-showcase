import * as faceApi from "face-api.js";
import * as React from "react";
import useResource from "./useResource";

const MODELS_URI = "/face-api/weights";

const ensureModels = async (nets: faceApi.NeuralNetwork<unknown>[]) =>
  Promise.all(
    nets.map((net) =>
      net.isLoaded ? Promise.resolve() : net.loadFromUri(MODELS_URI)
    )
  );

export type BaseFaceApiTask<AllFaces extends boolean> = AllFaces extends true
  ? faceApi.DetectAllFacesTask
  : faceApi.DetectSingleFaceTask;

export type ApplyWithExpressions<
  T,
  WithExpressions extends boolean
> = WithExpressions extends true ? faceApi.WithFaceExpressions<T> : T;

export type ApplyWithAgeAndGender<
  T,
  WithAgeAndGender extends boolean
> = WithAgeAndGender extends true ? faceApi.WithAge<faceApi.WithGender<T>> : T;

export default function useFaceApi<
  AllFaces extends boolean,
  WithExpressions extends boolean,
  WithAgeAndGender extends boolean
>(params: {
  tiny: boolean;
  allFaces: AllFaces;
  withExpressions?: WithExpressions;
  withAgeAndGender?: WithAgeAndGender;
}) {
  const { tiny, allFaces, withExpressions, withAgeAndGender } = params;
  const getNeuralNetwork = React.useCallback(async () => {
    const { nets } = faceApi;
    const models: faceApi.NeuralNetwork<unknown>[] = [
      tiny ? nets.tinyFaceDetector : nets.ssdMobilenetv1,
    ];
    if (withExpressions) models.push(nets.faceExpressionNet);
    if (withAgeAndGender) models.push(nets.ageGenderNet);
    await ensureModels(models);
    const opts = tiny
      ? new faceApi.TinyFaceDetectorOptions()
      : new faceApi.SsdMobilenetv1Options();
    async function applyModel(input: faceApi.TNetInput) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let task: any = (allFaces
        ? faceApi.detectAllFaces
        : faceApi.detectSingleFace)(input, opts);
      if (withExpressions) task = task.withFaceExpressions(tiny);
      if (withAgeAndGender) task = task.withAgeAndGender();
      const result = await (task as ApplyWithAgeAndGender<
        ApplyWithExpressions<BaseFaceApiTask<AllFaces>, WithExpressions>,
        WithAgeAndGender
      >);
      return !result ? null : Array.isArray(result) ? result : [result];
    }
    return { apply: applyModel };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiny, allFaces, withExpressions, withAgeAndGender]);
  return useResource(getNeuralNetwork);
}
