"use client";

import { useEffect, useRef, useState } from "react";

export default function PlayVideo() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const openAndLoad = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/videos/latest");

      if (!res.ok) {
        throw new Error("Failed to fetch latest video");
      }

      const json = await res.json();

      console.log("API Response:", json);

      if (json?.video?.url) {
        console.log("Video URL:", json.video.url);

        setUrl(json.video.url);
        setOpen(true);
      } else {
        setUrl(null);
        setError("No video is available.");
        setOpen(true);
      }
    } catch (err) {
      console.error(err);
      setUrl(null);
      setError("Unable to load video.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !videoRef.current) return;

    const video = videoRef.current;

    video.load();

    video
      .play()
      .then(() => console.log("Playing"))
      .catch((err) => console.log("Autoplay blocked:", err));
  }, [open, url]);

  return (
    <div className="text-center mb-8">
      <button
        type="button"
        onClick={openAndLoad}
        className="inline-flex items-center gap-3 rounded-full bg-white border-2 border-rose-700 px-6 py-3 shadow-sm hover:shadow-md transition"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-700 text-white">
          ▶
        </span>

        <span className="text-sm font-semibold text-rose-700">
          {loading ? "Loading..." : "Our Story"}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl overflow-hidden">

            <div className="flex justify-end p-3">
              <button
                onClick={() => {
                  videoRef.current?.pause();
                  setOpen(false);
                }}
                className="text-gray-600 hover:text-black"
              >
                Close
              </button>
            </div>

            <div className="p-4">

              {error ? (
                <p className="text-center text-red-600">{error}</p>
              ) : url ? (
                <video
                  ref={videoRef}
                  src={url}
                  controls
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  className="w-full rounded-lg"

                  onLoadedMetadata={() =>
                    console.log("Loaded Metadata")
                  }

                  onLoadedData={() =>
                    console.log("Loaded Data")
                  }

                  onCanPlay={() =>
                    console.log("Can Play")
                  }

                  onPlay={() =>
                    console.log("Playing")
                  }

                  onPause={() =>
                    console.log("Paused")
                  }

                  onEnded={() =>
                    console.log("Ended")
                  }

                  onError={(e) => {
                    console.error(
                      "Video Error:",
                      e.currentTarget.error
                    );
                    console.log("URL:", url);
                  }}
                />
              ) : (
                <p className="text-center">Loading video...</p>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}