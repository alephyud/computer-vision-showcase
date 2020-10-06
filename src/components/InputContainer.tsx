import React from "react";
import useCamera, { isCameraSource } from "../hooks/useCamera";
import useSizeRef from "../hooks/useSizeRef";
import { InputSource } from "../types";

export interface InputLayerProps {
  source: InputSource;
  mediaRef: React.RefObject<HTMLVideoElement>;
}

export default function InputContainer({ source, mediaRef }: InputLayerProps) {
  const camera = useCamera(source);
  const [containerRef, { width, height }] = useSizeRef<HTMLDivElement>();
  const [mediaAspectRatio, setMediaAspectRatio] = React.useState(1.0);
  const containerAspectRatio = width / height;
  React.useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.srcObject = camera.resource;
  }, [mediaRef, camera.resource]);
  const [mediaWidth, mediaHeight] =
    containerAspectRatio > mediaAspectRatio
      ? // container wider than media - same height
        [height * mediaAspectRatio, height]
      : // container narrower than media - same width
        [width, width / mediaAspectRatio];
  return (
    <div className="absolute inset-0 text-center bg-black" ref={containerRef}>
      {isCameraSource(source) ? (
        <video
          ref={mediaRef}
          onCanPlay={() => mediaRef.current?.play()}
          autoPlay
          playsInline
          muted
          width={mediaWidth}
          height={mediaHeight}
          className="absolute top-0"
          // Centre the media horizontally
          style={{ left: "50%", marginLeft: -mediaWidth / 2 }}
          onLoadedMetadata={({ currentTarget: t }) =>
            setMediaAspectRatio(t.videoWidth / t.videoHeight)
          }
        />
      ) : (
        <img
          ref={mediaRef as any}
          src="/cropped.jpg"
          width={mediaWidth}
          height={mediaHeight}
        />
      )}
      {camera.error && (
        <div
          className="text-white text-xl max-w-sm absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="mb-2">Camera access is disabled by your browser.</div>
          To run this app, allow it to use the camera and refresh the page.
        </div>
      )}
    </div>
  );
}
