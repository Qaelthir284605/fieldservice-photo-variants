import { saveWorkOrderPhoto } from "./fieldservice.js";

const result = await saveWorkOrderPhoto({ workOrderId: "WO-1042", technicianId: "tech-17", imageBase64: "aGVsbG8=", contentType: "image/jpeg" });
console.log(JSON.stringify({ workOrderId: result.workOrderId, dispatchStatus: result.dispatchStatus, variantReady: Boolean(result.variant) }, null, 2));
