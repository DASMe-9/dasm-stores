"use client";

import { useRef, useState } from "react";
import { X, Video, Image as ImageIcon, Star } from "lucide-react";
import { uploadApi } from "@/lib/api";

export interface MediaItem {
  id?: string | number; // Required if it's an existing media (e.g. from backend)
  url: string;
  is_primary: boolean;
  alt_text?: string | null;
  type: "image" | "video";
}

interface ProductMediaUploaderProps {
  media: MediaItem[];
  setMedia: (media: MediaItem[]) => void;
  onRemoveExisting?: (id: string | number) => void; // Optional hook when removing backend-saved media
  maxImages?: number;
  maxVideos?: number;
  imageAccept?: string;
  videoAccept?: string;
}

const DEFAULT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const DEFAULT_VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB

function isAllowedImageFile(file: File) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/pjpeg"]);
  if (allowed.has(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext);
}

function isAllowedVideoFile(file: File) {
  const allowed = new Set(["video/mp4", "video/webm", "video/quicktime"]);
  if (allowed.has(file.type)) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ["mp4", "webm", "mov"].includes(ext);
}

export function ProductMediaUploader({
  media,
  setMedia,
  onRemoveExisting,
  maxImages = 10,
  maxVideos = 2,
  imageAccept = DEFAULT_IMAGE_ACCEPT,
  videoAccept = DEFAULT_VIDEO_ACCEPT,
}: ProductMediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const images = media.filter((m) => m.type === "image");
  const videos = media.filter((m) => m.type === "video");

  const uploadMedia = async (type: "image" | "video", files: File[]) => {
    setError(null);
    if (!files.length) return;

    let errorMsg: string | null = null;
    const validFiles: File[] = [];

    for (const file of files) {
      if (type === "image") {
        if (!isAllowedImageFile(file)) {
          errorMsg = "صيغة غير مدعومة للصور. استخدم JPG, PNG, WebP.";
          break;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          errorMsg = "حجم الصورة يجب أن يكون أقل من 8MB.";
          break;
        }
        if (images.length + validFiles.length >= maxImages) {
          errorMsg = `الحد الأقصى ${maxImages} صور.`;
          break;
        }
      } else {
        if (!isAllowedVideoFile(file)) {
          errorMsg = "صيغة الفيديو غير مدعومة. استخدم MP4, WebM, MOV.";
          break;
        }
        if (file.size > MAX_VIDEO_BYTES) {
          errorMsg = "حجم الفيديو يجب أن يكون أقل من 20MB.";
          break;
        }
        if (videos.length + validFiles.length >= maxVideos) {
          errorMsg = `الحد الأقصى ${maxVideos} فيديوهات.`;
          break;
        }
      }
      validFiles.push(file);
    }

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setUploading(true);
    try {
      const newMedia: MediaItem[] = [];
      for (const file of validFiles) {
        const response =
          type === "image"
            ? await uploadApi.uploadStoreProductImage(file)
            : await uploadApi.uploadStoreProductVideo(file);

        const secureUrl = response.data?.secure_url;
        if (!secureUrl) throw new Error("لم يرجع الخادم رابطاً.");

        newMedia.push({
          url: secureUrl,
          type,
          is_primary: type === "image" && media.length === 0 && newMedia.length === 0,
        });
      }
      setMedia([...media, ...newMedia]);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? "تعذر رفع الملفات");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const item = media[index];
    if (item.id && onRemoveExisting) {
      onRemoveExisting(item.id);
    }

    const next = media.filter((_, i) => i !== index);
    
    // Ensure one image is primary if there are images left
    const hasImages = next.some(m => m.type === "image");
    if (hasImages && !next.some(m => m.is_primary && m.type === "image")) {
      const firstImgIdx = next.findIndex(m => m.type === "image");
      if (firstImgIdx !== -1) {
        next[firstImgIdx].is_primary = true;
      }
    }

    setMedia(next);
  };

  const handleSetPrimary = (index: number) => {
    if (media[index].type !== "image") return;
    
    const next = media.map((m, i) => ({
      ...m,
      is_primary: i === index,
    }));
    setMedia(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {media.map((item, idx) => (
          <div
            key={idx}
            className={`relative group w-24 h-24 rounded-xl overflow-hidden border-2 shadow-sm transition-all ${
              item.is_primary ? "border-emerald-500 shadow-emerald-500/20" : "border-gray-200 dark:border-zinc-700"
            }`}
          >
            {item.type === "image" ? (
              <img src={item.url} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <Video className="w-8 h-8 text-white/50" />
              </div>
            )}
            
            {item.is_primary && item.type === "image" && (
              <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                <Star className="h-2.5 w-2.5" />
                رئيسية
              </div>
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {!item.is_primary && item.type === "image" && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className="rounded-lg bg-white/90 p-1.5 text-emerald-600 hover:bg-white transition"
                  title="تعيين كصورة رئيسية"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="rounded-lg bg-white/90 p-1.5 text-red-600 hover:bg-white transition"
                title="حذف"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-zinc-500 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition bg-gray-50 dark:bg-zinc-800/50 disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ImageIcon className="w-6 h-6" />
            )}
            <span className="text-[10px]">إضافة صور</span>
          </button>
        )}

        {videos.length < maxVideos && (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-zinc-500 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition bg-gray-50 dark:bg-zinc-800/50 disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Video className="w-6 h-6" />
            )}
            <span className="text-[10px]">إضافة فيديو</span>
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <input
        type="file"
        ref={imageInputRef}
        accept={imageAccept}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          if (files.length) uploadMedia("image", files);
        }}
      />
      <input
        type="file"
        ref={videoInputRef}
        accept={videoAccept}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = "";
          if (files.length) uploadMedia("video", files);
        }}
      />
    </div>
  );
}
