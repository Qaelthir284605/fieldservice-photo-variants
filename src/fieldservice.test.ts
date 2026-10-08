import assert from "node:assert/strict";
import { dispatchDecision, WorkOrderPhoto } from "./fieldservice.js";

assert.equal(dispatchDecision(true), "follow_up_required");
assert.equal(dispatchDecision(false), "awaiting_photo");
assert.equal(WorkOrderPhoto.parse({ workOrderId: "WO-7", technicianId: "tech-2", imageBase64: "aGVsbG8=" }).contentType, "image/jpeg");
console.log("field-service decision test passed");
