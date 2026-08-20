import { Schema, model, models } from "mongoose";

const LeadSchema = new Schema({
  visitorId: String,
  sessionId: String,
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: String,
  interest: { type: String, required: true, index: true },
  message: String,
  source: String,
  medium: String,
  channel: String,
  campaign: String,
  content: String,
  referrer: String,
  ip: String,
  country: String,
  region: String,
  city: String,
  device: String,
  browser: String,
  os: String,
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false });

export default models.Lead || model("Lead", LeadSchema);
