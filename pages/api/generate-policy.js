// pages/api/generate-policy.js
import { connectToDatabase } from '../../utils/mongodb';
import PolicyTemplate from '../../models/PolicyTemplate';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const { policyName, entityName, effectiveDate, customField1, customField2, templateId } = req.body;

      // Save policy data to MongoDB
      await db.collection('policies').insertOne({
        policyName,
        entityName,
        effectiveDate,
        customField1,
        customField2,
        templateId,
      });

      // Fetch the selected template
      const template = await PolicyTemplate.findById(templateId);
      if (!template) {
        return res.status(400).json({ message: 'Template not found' });
      }

      // Generate Word document using the template
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(template.content
                .replace('{{policyName}}', policyName)
                .replace('{{entityName}}', entityName)
                .replace('{{effectiveDate}}', effectiveDate)
                .replace('{{customField1}}', customField1)
                .replace('{{customField2}}', customField2)
              )],
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
