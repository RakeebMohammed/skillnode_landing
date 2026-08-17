import { Schema, model, models } from "mongoose";

const SessionSchema = new Schema({
  sessionId: { type: String, unique: true, required: true, index: true },
  visitorId: { type: String, required: true, index: true },
  startedAt: { type: Date, default: Date.now, index: true },
  lastSeen: { type: Date, default: Date.now, index: true },
  endedAt: Date,
  landingPage: String,
  currentPage: String,
  exitPage: String,
  duration: { type: Number, default: 0 },
  source: String,
  medium: String,
  channel: String,
  campaign: String,
  content: String,
  term: String,
  referrer: String,
  landingPageUrl: String,
  ip: String,
  country: String,
  region: String,
  city: String,
  device: String,
  browser: String,
  os: String,
  pageCount: { type: Number, default: 0 },
  eventCount: { type: Number, default: 0 },
}, { versionKey: false });

export default models.Session || model("Session", SessionSchema);
