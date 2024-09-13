// models/PolicyTemplate.js
import mongoose from 'mongoose';

const PolicyTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['html', 'text'], default: 'html' },
  category: { type: String, enum: ['NIST CSF', 'ISO 27001'], required: true }
}, { timestamps: true });

const PolicyTemplate = mongoose.models.PolicyTemplate || mongoose.model('PolicyTemplate', PolicyTemplateSchema);

export default PolicyTemplate;
