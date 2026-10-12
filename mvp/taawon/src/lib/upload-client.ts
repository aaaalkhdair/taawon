"use client";
import { upload } from "@vercel/blob/client";

/** Uploads a video from the browser and returns its public URL. */
export async function uploadVideo(file: File, onProgress?: (pct: number) => void): Promise<string> {
  if (process.env.NEXT_PUBLIC_USE_BLOB === "1") {
    const blob = await upload(`videos/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      onUploadProgress: (e) => onProgress?.(Math.round(e.percentage)),
    });
    return blob.url;
  }
  const fd = new FormData();
  fd.append("file", file);
  onProgress?.(30);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("upload failed");
  onProgress?.(100);
  const json = (await res.json()) as { url: string };
  return json.url;
}
