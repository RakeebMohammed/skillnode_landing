import { Schema, model, models } from "mongoose";

const VisitorSchema = new Schema({
  visitorId: { type: String, unique: true, required: true, index: true },
  ip: String,
  country: String,
  region: String,
  city: String,
  latitude: Number,
  longitude: Number,
  device: String,
  browser: String,
  os: String,
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now, index: true },
  firstSource: String,
  firstMedium: String,
  firstChannel: String,
  firstCampaign: String,
  firstLandingPage: String,
  firstReferrer: String,
}, { versionKey: false });

export default models.Visitor || model("Visitor", VisitorSchema);
