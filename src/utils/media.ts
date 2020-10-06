import { createCanvasFromMedia } from "face-api.js";

export function createCanvasFromMediaOrNull(
  media: HTMLVideoElement | HTMLImageElement | ImageData
) {
  try {
    return createCanvasFromMedia(media);
  } catch (e) {
    // media not yet initialised
    return null;
  }
}
