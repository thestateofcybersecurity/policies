// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const docx = require('docx');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/policy_automation', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Policy Schema
const policySchema = new mongoose.Schema({
  policyName: String,
  entityName: String,
  effectiveDate: Date,
  customField1: String,
  customField2: String,
});

const Policy = mongoose.model('Policy', policySchema);

app.post('/api/generate-policy', async (req, res) => {
  try {
    const { policyName, entityName, effectiveDate, customField1, customField2 } = req.body;

    // Save policy data to MongoDB
    const newPolicy = new Policy({
      policyName,
      entityName,
      effectiveDate,
      customField1,
      customField2,
    });
    await newPolicy.save();

    // Generate Word document
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [new docx.TextRun(`Policy Name: ${policyName}`)],
          }),
          new docx.Paragraph({
            children: [new docx.TextRun(`Entity Name: ${entityName}`)],
          }),
          new docx.Paragraph({
            children: [new docx.TextRun(`Effective Date: ${effectiveDate}`)],
          }),
          new docx.Paragraph({
            children: [new docx.TextRun(`Custom Field 1: ${customField1}`)],
          }),
          new docx.Paragraph({
            children: [new docx.TextRun(`Custom Field 2: ${customField2}`)],
          }),
        ],
      }],
    });

    // Generate document buffer
    const buffer = await docx.Packer.toBuffer(doc);

    // Save the document
    const fileName = `${policyName.replace(/\s+/g, '_')}.docx`;
    const filePath = path.join(__dirname, 'generated_policies', fileName);
    fs.writeFileSync(filePath, buffer);

    res.json({ message: 'Policy generated successfully', fileName });
  } catch (error) {
    console.error('Error generating policy:', error);
    res.status(500).json({ message: 'Error generating policy' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
