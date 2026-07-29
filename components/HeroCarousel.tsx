"use client";

import { useEffect, useState } from "react";
import { hasSupabaseEnv, supabaseClient } from "@/lib/supabaseClient";

export default function HeroCarousel() {
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroAlts, setHeroAlts] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const getSupabaseErrorMessage = (error: unknown) => {
    if (!error) return "Unknown Supabase error.";
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;

    const err = error as Record<string, any>;
    return (
      err.message || err.error_description || err.details || err.hint || JSON.stringify(error, Object.getOwnPropertyNames(error)) || String(error)
    );
  };

  useEffect(() => {
    const loadHeroImages = async () => {
      if (!hasSupabaseEnv) {
        setHeroImages([]);
        setIsLoaded(true);
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from("hero_settings")
          .select("hero_images, hero_image_alts, hero_image_url, hero_image_alt")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data && typeof data === "object") {
          const heroSettings = data as {
            hero_images?: string[] | null;
            hero_image_alts?: string[] | null;
            hero_image_url?: string | null;
            hero_image_alt?: string | null;
          };

          const images = Array.isArray(heroSettings.hero_images) && heroSettings.hero_images.length > 0
            ? heroSettings.hero_images.slice(0, 5).filter(Boolean)
            : heroSettings.hero_image_url
              ? [heroSettings.hero_image_url]
              : [];

          const alts = Array.isArray(heroSettings.hero_image_alts) && heroSettings.hero_image_alts.length > 0
            ? heroSettings.hero_image_alts.slice(0, 5)
            : heroSettings.hero_image_alt
              ? [heroSettings.hero_image_alt]
              : [];

          setHeroImages(images);
          setHeroAlts(alts);
        }
      } catch (err) {
        const message = getSupabaseErrorMessage(err);
        console.warn("Failed to load hero images:", message);
      } finally {
        setIsLoaded(true);
      }
    };

    loadHeroImages();
  }, []);

  useEffect(() => {
    if (!heroImages.length) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [heroImages]);

  if (!isLoaded) {
    return <div className="absolute inset-0 h-full w-full bg-gray-200" />;
  }

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      {heroImages.length > 0 ? (
        heroImages.map((src, index) => (
          <img
            key={src + index}
            src={src}
            alt={heroAlts[index] ?? `Hero image ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))
      ) : (
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-rose-800 via-rose-600 to-amber-400" />
      )}
    </div>
  );
}

