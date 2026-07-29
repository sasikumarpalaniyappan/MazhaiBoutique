const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const hasCloudinaryConfig = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);

export type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb" | "pad";
  gravity?: "auto" | "face" | "center";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png" | "avif";
  dpr?: "auto" | number;
};

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  createdAt: string;
  originalFilename?: string;
  deleteToken?: string;
};

export type CloudinaryUploadOptions = {
  folder?: string;
  tags?: string[];
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
};

const ensureConfig = () => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("Missing Cloudinary cloud name. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_CLOUD_NAME.");
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Missing Cloudinary upload preset. Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET or VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  };
};

const toTransformationSegment = (options: CloudinaryTransformOptions = {}) => {
  const parts: string[] = [];

  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  if (options.quality) parts.push(`q_${options.quality}`);
  if (options.format) parts.push(`f_${options.format}`);
  if (options.dpr) parts.push(`dpr_${options.dpr}`);

  return parts.join(",");
};

const toUploadResult = (payload: any): CloudinaryUploadResult => ({
  secureUrl: String(payload.secure_url || ""),
  publicId: String(payload.public_id || ""),
  resourceType: String(payload.resource_type || "image"),
  format: String(payload.format || ""),
  bytes: Number(payload.bytes || 0),
  width: payload.width != null ? Number(payload.width) : undefined,
  height: payload.height != null ? Number(payload.height) : undefined,
  createdAt: String(payload.created_at || new Date().toISOString()),
  originalFilename:
    payload.original_filename != null ? String(payload.original_filename) : undefined,
  deleteToken: payload.delete_token != null ? String(payload.delete_token) : undefined,
});

export const cloudinaryService = {
  getConfig() {
    return ensureConfig();
  },

  uploadImage(file: File, options: CloudinaryUploadOptions = {}) {
    const { cloudName, uploadPreset } = ensureConfig();

    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const formData = new FormData();

      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      if (options.folder) {
        formData.append("folder", options.folder);
      }

      if (options.tags && options.tags.length > 0) {
        formData.append("tags", options.tags.join(","));
      }

      const xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint);

      if (options.signal) {
        if (options.signal.aborted) {
          reject(new Error("Upload aborted"));
          return;
        }

        const abortHandler = () => {
          xhr.abort();
          reject(new Error("Upload aborted"));
        };

        options.signal.addEventListener("abort", abortHandler, { once: true });

        xhr.addEventListener(
          "loadend",
          () => {
            options.signal?.removeEventListener("abort", abortHandler);
          },
          { once: true }
        );
      }

      xhr.upload.onprogress = (event) => {
        if (!options.onProgress || !event.lengthComputable) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        options.onProgress(percent);
      };

      xhr.onerror = () => {
        reject(new Error("Cloudinary upload failed due to a network error."));
      };

      xhr.onabort = () => {
        reject(new Error("Cloudinary upload aborted."));
      };

      xhr.onload = () => {
        let payload: any = null;

        try {
          payload = JSON.parse(xhr.responseText || "{}");
        } catch {
          reject(new Error("Cloudinary upload failed: invalid JSON response."));
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          const apiMessage = payload?.error?.message;
          reject(new Error(apiMessage || "Cloudinary upload failed."));
          return;
        }

        const result = toUploadResult(payload);

        if (!result.secureUrl || !result.publicId) {
          reject(new Error("Cloudinary upload failed: missing secure_url or public_id."));
          return;
        }

        options.onProgress?.(100);
        resolve(result);
      };

      xhr.send(formData);
    });
  },

  async uploadImages(
    files: File[],
    options: Omit<CloudinaryUploadOptions, "onProgress"> & {
      onFileProgress?: (fileIndex: number, percent: number) => void;
      onOverallProgress?: (percent: number) => void;
    } = {}
  ) {
    const uploads: CloudinaryUploadResult[] = [];
    const total = files.length;

    for (let index = 0; index < total; index += 1) {
      const file = files[index];

      const result = await this.uploadImage(file, {
        ...options,
        onProgress: (percent) => {
          options.onFileProgress?.(index, percent);
          const overallPercent = Math.round(((index + percent / 100) / total) * 100);
          options.onOverallProgress?.(overallPercent);
        },
      });

      uploads.push(result);
      options.onOverallProgress?.(Math.round(((index + 1) / total) * 100));
    }

    return uploads;
  },

  // Delete token works for a short window after unsigned upload.
  async deleteByToken(deleteToken: string) {
    if (!deleteToken) {
      throw new Error("Missing Cloudinary delete token.");
    }

    const response = await fetch("https://api.cloudinary.com/v1_1/delete_by_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ token: deleteToken }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const apiMessage = payload?.error?.message;
      throw new Error(apiMessage || "Cloudinary delete by token failed.");
    }

    return payload;
  },

  async deleteByPublicId(publicId: string) {
    if (!publicId) {
      throw new Error("Missing Cloudinary public id.");
    }

    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const apiMessage = payload?.error || payload?.message;
      throw new Error(apiMessage || "Cloudinary delete failed.");
    }

    return payload;
  },

  getOptimizedImageUrl(publicId: string, options: CloudinaryTransformOptions = {}) {
    const { cloudName } = ensureConfig();

    if (!publicId) return "";

    const transformSegment = toTransformationSegment({
      quality: "auto",
      format: "auto",
      ...options,
    });

    if (!transformSegment) {
      return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
    }

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformSegment}/${publicId}`;
  },
};
