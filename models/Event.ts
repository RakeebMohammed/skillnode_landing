import { Schema, model, models } from "mongoose";

const EventSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  type: { type: String, required: true, index: true },
  page: String,
  element: String,
  metadata: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false });

export default models.AnalyticsEvent || model("AnalyticsEvent", EventSchema);
