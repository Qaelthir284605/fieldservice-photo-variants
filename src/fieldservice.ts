import { z } from "zod";
import { infrai } from "./infrai.js";

export const WorkOrderPhoto = z.object({
  workOrderId: z.string().min(1),
  technicianId: z.string().min(1),
  imageBase64: z.string().min(1),
  contentType: z.string().default("image/jpeg"),
});
export type WorkOrderPhotoInput = z.input<typeof WorkOrderPhoto>;

export async function saveWorkOrderPhoto(input: WorkOrderPhotoInput) {
  const photo = WorkOrderPhoto.parse(input);
  const bucket = "field-service-photos";
  try {
    await infrai.storage.bucket.create({ name: bucket });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("is already taken")) throw error;
  }
  const originalKey = `${photo.workOrderId}/${photo.technicianId}/original`;
  await infrai.storage.object.put(bucket, originalKey, { data_base64: photo.imageBase64, content_type: photo.contentType, idempotency_key: originalKey });
  const resized = await infrai.image.resize({ image: photo.imageBase64, width: 1600, height: 1200, fit: "inside", enlarge: false, format: "webp", store: false }) as { image?: string };
  if (!resized.image) throw new Error("Image resize returned no image");
  const compressed = await infrai.image.compress({ image: resized.image, format: "webp" }) as { image?: string };
  if (!compressed.image) throw new Error("Image compression returned no image");
  return { workOrderId: photo.workOrderId, technicianId: photo.technicianId, dispatchStatus: "follow_up_required", variant: compressed.image };
}

export function dispatchDecision(hasPhoto: boolean): "follow_up_required" | "awaiting_photo" {
  return hasPhoto ? "follow_up_required" : "awaiting_photo";
}
