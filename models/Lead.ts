import { Schema, deleteModel, model, models } from "mongoose";

const LeadSchema = new Schema({
  visitorId: String,
  sessionId: String,
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  phone: String,
  formType: { type: String, enum: ["freelancer"], default: "freelancer", index: true },
  freelancerCategory: { type: String, required: true, index: true },
  freelancerSubcategory: { type: String, required: true, index: true },
  services: { type: String, required: true },
  experience: { type: String, required: true },
  workMode: { type: String, required: true },
  serviceLocation: { type: String, required: true },
  availability: { type: String, required: true },
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

// Next.js hot reload can otherwise retain an older compiled schema and silently
// discard newly added questionnaire fields when a lead is saved.
const cachedLeadModel = models.Lead;
const currentSchemaSignature = Object.keys(LeadSchema.paths).sort().join("|");
const cachedSchemaSignature = cachedLeadModel
  ? Object.keys(cachedLeadModel.schema.paths).sort().join("|")
  : "";

if (cachedLeadModel && cachedSchemaSignature !== currentSchemaSignature) {
  deleteModel("Lead");
}

export default models.Lead || model("Lead", LeadSchema);
