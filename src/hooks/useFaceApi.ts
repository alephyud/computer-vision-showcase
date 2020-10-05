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

export type ApplyWithExpressions<
  WithExpressions extends boolean,
  T
> = WithExpressions extends true ? faceApi.WithFaceExpressions<T> : T;

export type ApplyWithAgeAndGender<
  WithAgeAndGender extends boolean,
  T
> = WithAgeAndGender extends true ? faceApi.WithAge<faceApi.WithGender<T>> : T;

export interface FaceApiParams<
  AllFaces extends boolean = boolean,
  WithExpressions extends boolean = boolean,
  WithAgeAndGender extends boolean = boolean
> {
  tiny: boolean;
  allFaces: AllFaces;
  withExpressions: WithExpressions;
  withAgeAndGender: WithAgeAndGender;
}

export default function useFaceApi<
  AllFaces extends boolean,
  WithExpressions extends boolean,
  WithAgeAndGender extends boolean
>(params: FaceApiParams<AllFaces, WithExpressions, WithAgeAndGender>) {
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
      if (withExpressions) task = task.withFaceExpressions();
      if (withAgeAndGender) task = task.withAgeAndGender();
      let result = await task;
      result = !result ? [] : Array.isArray(result) ? result : [result];
      if (!withExpressions || !withAgeAndGender)
        result = result.map((rec: faceApi.FaceDetection) => ({
          detection: rec,
        }));
      return result as ApplyWithAgeAndGender<
        WithAgeAndGender,
        ApplyWithExpressions<
          WithExpressions,
          { detection: faceApi.FaceDetection }
        >
      >[];
    }
    return { apply: applyModel };
  }, [tiny, allFaces, withExpressions, withAgeAndGender]);
  return useResource(getNeuralNetwork);
}
