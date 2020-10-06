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
      {isCameraSource(source) && (
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
      )}
    </div>
  );
}
