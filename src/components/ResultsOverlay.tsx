import React from "react";
import { Resource } from "../hooks/useResource";
import { FaceResult } from "../types";
import FaceDetectionResults from "./FaceDetectionResults";

export default function ResultLayer({
  results: { resource: output, loading, lastStart, lastEnd },
  width,
  height,
  transitions,
}: {
  results: Resource<FaceResult[] | null>;
  width?: number;
  height?: number;
  transitions: boolean;
}) {
  return (
    <div
      className="absolute top-0 text-center"
      // Centre horizontally to align with the input media
      style={{ left: "50%", marginLeft: -(width || 0) / 2, width, height }}
    >
      <div>
        {!loading && output && (
          <>
            <div>
              {output.length} face{output.length !== 1 && "s"} | done in{" "}
              {(lastEnd.getTime() - lastStart.getTime()) / 1000}s
            </div>
          </>
        )}
        {output && (
          <FaceDetectionResults
            results={output}
            width={width}
            height={height}
            transitions={transitions}
          />
        )}
      </div>
    </div>
  );
}
