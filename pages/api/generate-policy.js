// pages/api/generate-policy.js
import { connectToDatabase } from '../../utils/mongodb';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const { policyName, entityName, effectiveDate, customField1, customField2 } = req.body;

      // Save policy data to MongoDB
      await db.collection('policies').insertOne({
        policyName,
        entityName,
        effectiveDate,
        customField1,
        customField2,
      });

      // Generate Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(`Policy Name: ${policyName}`)],
            }),
            new Paragraph({
              children: [new TextRun(`Entity Name: ${entityName}`)],
            }),
            new Paragraph({
              children: [new TextRun(`Effective Date: ${effectiveDate}`)],
            }),
            new Paragraph({
              children: [new TextRun(`Custom Field 1: ${customField1}`)],
            }),
            new Paragraph({
              children: [new TextRun(`Custom Field 2: ${customField2}`)],
            }),
          ],
        }],
      });

      // Generate document buffer
      const buffer = await Packer.toBuffer(doc);

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename=${policyName.replace(/\s+/g, '_')}.docx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

      // Send the buffer as the response
      res.send(buffer);

    } catch (error) {
      console.error('Error generating policy:', error);
      res.status(500).json({ message: 'Error generating policy' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
