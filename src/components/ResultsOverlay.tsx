import React from "react";
import { Resource } from "../hooks/useResource";
import { FaceResult } from "../types";
import FaceDetectionResults from "./FaceDetectionResults";

interface Props {
  results: Resource<{
    result: FaceResult[];
    startTime: Date;
    endTime: Date;
  } | null>;
  width?: number;
  height?: number;
  transitions: boolean;
}

export default function ResultLayer({
  results: { resource },
  width,
  height,
  transitions,
}: Props) {
  if (!resource) return null;
  const { result, startTime, endTime } = resource;
  return (
    <div
      className="absolute top-0 text-center"
      // Centre horizontally to align with the input media
      style={{ left: "50%", marginLeft: -(width || 0) / 2, width, height }}
    >
      <div>
        {result.length} face{result.length !== 1 && "s"} | done in{" "}
        {(endTime.getTime() - startTime.getTime()) / 1000}s
      </div>
      <FaceDetectionResults
        results={result}
        width={width}
        height={height}
        transitions={transitions}
      />
    </div>
  );
}
