import mongoose, { Schema, model, models } from "mongoose";

const AdminSchema = new Schema({
  email: { type: String, unique: true, required: true, index: true },
  name: { type: String, default: "Administrator" },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default models.Admin || model("Admin", AdminSchema);
