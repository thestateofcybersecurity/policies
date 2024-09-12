// models/PolicyTemplate.js
import mongoose from 'mongoose';

const PolicyTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.PolicyTemplate || mongoose.model('PolicyTemplate', PolicyTemplateSchema);
