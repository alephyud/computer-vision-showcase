import * as faceApi from "face-api.js";

export type CameraInputSource = "frontalCamera" | "backCamera";

export type InputSource = "imageUpload" | CameraInputSource;

export type FaceResult = {
  detection: faceApi.FaceDetection;
  age?: number;
  gender?: faceApi.Gender;
  expressions?: faceApi.FaceExpressions;
};
