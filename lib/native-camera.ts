"use client";

import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

/** Tar bilde via native kamera i iOS-appen; returnerer null på web. */
export async function takeNativePhoto(): Promise<File | null> {
  if (!Capacitor.isNativePlatform()) return null;

  const photo = await Camera.getPhoto({
    quality: 70,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    correctOrientation: true,
  });

  if (!photo.webPath) return null;

  const response = await fetch(photo.webPath);
  const blob = await response.blob();
  const name = `foto-${Date.now()}.jpg`;
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}
