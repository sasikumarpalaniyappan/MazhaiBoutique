"use client";

import React, { useEffect, useState } from "react";
import { hasSupabaseEnv, supabaseClient } from "@/lib/supabaseClient";
import { cloudinaryService, hasCloudinaryConfig } from "@/lib/cloudinary";

const MAX_HERO_IMAGES = 5;

type HeroSlot = {
  url: string;
  alt: string;
  file: File | null;
  previewUrl: string | null;
};

const sanitizeFileName = (value?: string) => {
  if (!value) return "file";
  return value
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9._-]/g, "_");
};

const createEmptySlots = (): HeroSlot[] =>
  Array.from({ length: MAX_HERO_IMAGES }, () => ({ url: "", alt: "", file: null, previewUrl: null }));

const normalizeHeroSettings = (images: unknown, alts: unknown): HeroSlot[] => {
  const imageUrls = Array.isArray(images) ? images.map((item) => String(item || "")) : [];
  const imageAlts = Array.isArray(alts) ? alts.map((item) => String(item || "")) : [];

  const slots: HeroSlot[] = createEmptySlots();

  imageUrls.slice(0, MAX_HERO_IMAGES).forEach((url, index) => {
    if (!url) return;
    slots[index] = {
      url,
      alt: imageAlts[index] ?? `Hero image ${index + 1}`,
      file: null,
      previewUrl: null,
    };
  });

  return slots;
};

const uploadHeroImage = async (file: File, index: number) => {
  const filenameTag = sanitizeFileName(file.name);
  const result = await cloudinaryService.uploadImage(file, {
    folder: `mazhai-boutique/hero/${index + 1}`,
    tags: ["mazhai-boutique", "hero", `hero-${index + 1}`],
    onProgress: () => {},
  });

  return result.secureUrl;
};

const HeroEditor = () => {
  const [slots, setSlots] = useState<HeroSlot[]>(createEmptySlots());
  const [heroSettingsId, setHeroSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const cloudinaryReady = hasCloudinaryConfig;

  useEffect(() => {
    const loadHeroSettings = async () => {
      if (!hasSupabaseEnv) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabaseClient
          .from("hero_settings")
          .select("id, hero_images, hero_image_alts")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data && typeof data === "object") {
          setHeroSettingsId((data as any).id ?? null);
          setSlots(normalizeHeroSettings((data as any).hero_images, (data as any).hero_image_alts));
        }
      } catch (err) {
        console.warn("Unable to load hero settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHeroSettings();
  }, []);

  const handleImageChange = (index: number, file: File | null) => {
    setSlots((prev) => {
      const next = [...prev];
      const previewUrl = file ? URL.createObjectURL(file) : null;

      if (next[index].previewUrl) {
        URL.revokeObjectURL(next[index].previewUrl);
      }

      next[index] = {
        ...next[index],
        file,
        previewUrl,
        url: file ? next[index].url : next[index].url,
      };
      return next;
    });
  };

  const handleAltChange = (index: number, value: string) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], alt: value };
      return next;
    });
  };

  const handleRemove = (index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      if (next[index].previewUrl) {
        URL.revokeObjectURL(next[index].previewUrl);
      }
      next[index] = { url: "", alt: "", file: null, previewUrl: null };
      return next;
    });
  };

  const handleSave = async () => {
    if (!hasSupabaseEnv) {
      setFeedback("Supabase is not configured yet.");
      return;
    }

    if (!cloudinaryReady) {
      setFeedback("Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const updatedSlots = await Promise.all(
        slots.map(async (slot, index) => {
          if (slot.file) {
            const secureUrl = await uploadHeroImage(slot.file, index);
            if (slot.previewUrl) {
              URL.revokeObjectURL(slot.previewUrl);
            }
            return {
              ...slot,
              url: secureUrl,
              file: null,
              previewUrl: null,
            };
          }
          return slot;
        })
      );

      const heroImages = updatedSlots.filter((slot) => slot.url).map((slot) => slot.url);
      const heroAlts = updatedSlots.filter((slot) => slot.url).map((slot) => slot.alt || "Hero image");

      const payload = {
        hero_images: heroImages,
        hero_image_alts: heroAlts,
        updated_at: new Date().toISOString(),
      };

      if (heroSettingsId) {
        const { error } = await (supabaseClient as any)
          .from("hero_settings")
          .update(payload)
          .eq("id", heroSettingsId);

        if (error) throw error;
      } else {
        const { data, error } = await (supabaseClient as any)
          .from("hero_settings")
          .insert([payload])
          .select("id")
          .single();

        if (error) throw error;
        setHeroSettingsId((data as any)?.id ?? null);
      }

      setSlots(updatedSlots);
      setFeedback("Hero images saved successfully.");
    } catch (err) {
      setFeedback(`Save failed: ${String(err)}`);
      console.error("Hero editor save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Hero Page Image Editor</h1>
          <p className="text-sm text-gray-500">Upload and manage up to 5 hero images for the homepage.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasSupabaseEnv || saving || loading}
          className="rounded bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Hero Images"}
        </button>
      </div>

      <div className="grid gap-4">
        {feedback ? (
          <div className="rounded border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{feedback}</div>
        ) : null}
        {!cloudinaryReady ? (
          <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Cloudinary is not configured. Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> to enable hero image uploads.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot, index) => (
            <div key={index} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 h-44 overflow-hidden rounded-2xl bg-gray-100">
                {slot.previewUrl ? (
                  <img src={slot.previewUrl} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                ) : slot.url ? (
                  <img src={slot.url} alt={slot.alt || `Hero image ${index + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">Slot {index + 1}</div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Upload image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    handleImageChange(index, file);
                  }}
                  className="w-full text-sm file:mr-2 file:rounded file:border-0 file:bg-rose-50 file:px-3 file:py-1.5 file:text-sm file:text-rose-700"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700">Alt text</label>
                  <input
                    value={slot.alt}
                    onChange={(event) => handleAltChange(index, event.target.value)}
                    className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                    placeholder={`Hero image ${index + 1}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-800"
                >
                  Remove image
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500">You can store up to {MAX_HERO_IMAGES} hero images. Leave any slots blank to keep fewer images.</p>
      </div>
    </div>
  );
};

export default HeroEditor;
