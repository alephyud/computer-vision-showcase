import * as faceApi from "face-api.js";
import React from "react";

export type CameraInputSource = "frontalCamera" | "backCamera";
export type InputSource = "imageUpload" | CameraInputSource;

// A return value of React.useState<T>
export type UseState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

// A more consistent version of face-api.js output format
export type FaceResult = {
  detection: faceApi.FaceDetection;
  age?: number;
  gender?: faceApi.Gender;
  expressions?: faceApi.FaceExpressions;
};
