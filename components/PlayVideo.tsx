"use client";

import { useEffect, useRef, useState } from "react";

export default function PlayVideo() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const openAndLoad = async () => {
    try {
      const res = await fetch("/api/videos/latest");
      const json = await res.json();
      const video = json?.video;
      if (video?.url) {
        setUrl(video.url);
        setOpen(true);
      } else {
        // fallback to static public path
        setUrl("/videos/about-video.mp4");
        setOpen(true);
      }
    } catch {
      setUrl("/videos/about-video.mp4");
      setOpen(true);
    }
  };

  useEffect(() => {
    if (open) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      videoRef.current && (videoRef.current.currentTime = 0);
    }
  }, [open]);

  return (
    <div className="text-center mb-8">
      <button
        type="button"
        onClick={openAndLoad}
        className="inline-flex items-center gap-3 rounded-full bg-white border-2 border-rose-700 px-6 py-3 shadow-sm hover:shadow-md transition"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-700 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
            <path fill="currentColor" d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="text-sm font-semibold text-rose-700">Our story</span>
      </button>

      {open && url ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:text-gray-900 px-3 py-1"
              >
                Close
              </button>
            </div>
            <div className="px-4 pb-4">
              <video ref={videoRef} src={url} controls className="w-full h-auto rounded-md" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
