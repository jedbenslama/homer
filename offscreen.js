chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CONVERT_MP4_TO_GIF") {
    convertToGif(msg.dataUrl, msg.fps || 10, msg.quality || 10, msg.width || 0)
      .then((gifDataUrl) => sendResponse({ gifDataUrl }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

async function convertToGif(mp4DataUrl, fps, quality, targetWidth) {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;

  await new Promise((resolve, reject) => {
    video.addEventListener("canplay", resolve, { once: true });
    video.addEventListener("error", (e) => reject(new Error("Video load error")), { once: true });
    video.src = mp4DataUrl;
  });

  let w = targetWidth || video.videoWidth;
  let h = targetWidth
    ? Math.round((video.videoHeight / video.videoWidth) * targetWidth)
    : video.videoHeight;

  // cap to reasonable size for GIF
  const maxDim = 600;
  if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });

  const encoder = new GIFEncoder();
  encoder.setRepeat(0);
  encoder.setFrameRate(fps);
  encoder.setQuality(quality);
  encoder.start();

  const duration = video.duration;
  const interval = 1 / fps;
  let currentTime = 0;

  let seekResolve;
  video.addEventListener("seeked", () => {
    if (seekResolve) seekResolve();
  });

  while (currentTime <= duration) {
    video.currentTime = currentTime;
    await new Promise((r) => (seekResolve = r));
    ctx.drawImage(video, 0, 0, w, h);
    encoder.addFrame(ctx);
    currentTime += interval;
  }

  encoder.finish();

  const stream = encoder.stream();
  const bin = new Uint8Array(stream.bin);
  let binaryStr = "";
  for (let i = 0; i < bin.length; i++) {
    binaryStr += String.fromCharCode(bin[i]);
  }
  return "data:image/gif;base64," + btoa(binaryStr);
}
