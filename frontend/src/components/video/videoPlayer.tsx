// VideoPlayer.jsx
import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    let hls;

    // shared retry logic
    const doRetry = (loadFn) => {
      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        const delay = 1000 * retryCount.current; // 1s, 2s, 3s…
        console.warn(
          `Video load failed – retry #${retryCount.current} in ${delay}ms`
        );
        setTimeout(loadFn, delay);
      } else {
        console.error("Video load failed after max retries.");
      }
    };

    const initNative = () => {
      videoRef.current.src = src;
      // if native <video> errors, retry it
      const onNativeError = () => {
        doRetry(initNative);
      };
      videoRef.current.addEventListener("error", onNativeError, { once: true });
    };

    if (videoRef.current) {
      if (Hls.isSupported()) {
        hls = new Hls();

        // catch Hls.js errors
        hls.on(Hls.Events.ERROR, (_event, data) => {
          const isNetworkErr =
            data.type === Hls.ErrorTypes.NETWORK_ERROR && data.fatal;
          if (isNetworkErr) {
            doRetry(() => {
              // re-load the same source
              hls.loadSource(src);
              hls.attachMedia(videoRef.current);
            });
          }
        });

        // initial load
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        // native HLS fallback
        initNative();
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      retryCount.current = 0;
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="rounded-2xl object-cover"
    />
  );
};

export default VideoPlayer;
