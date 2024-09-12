import { connectToDatabase } from '../../utils/mongodb';
import PolicyTemplate from '../../models/PolicyTemplate';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await connectToDatabase();
      
      const { templateIds, commonFields } = req.body;
      
      if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or missing templateIds' });
      }

      const templates = await PolicyTemplate.find({ _id: { $in: templateIds } });

      if (templates.length === 0) {
        return res.status(404).json({ success: false, message: 'No templates found' });
      }

      const generatedPolicies = await Promise.all(templates.map(async (template) => {
        let content = template.content;
        
        // Replace common fields
        Object.entries(commonFields).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
        });

        const policyNumber = generatePolicyNumber();
        const effectiveDate = new Date().toISOString().split('T')[0];
        
        // Generate unique fields
        content = content.replace(/{{policy_number}}/g, policyNumber);
        content = content.replace(/{{effective_date}}/g, effectiveDate);
        content = content.replace(/{{date_issued}}/g, effectiveDate);
        content = content.replace(/{{date_reviewed}}/g, effectiveDate);
        content = content.replace(/{{updated_date}}/g, effectiveDate);

        // Create docx document
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                children: [new TextRun(content)],
              }),
            ],
          }],
        });

        // Generate buffer
        const buffer = await Packer.toBuffer(doc);

        return {
          name: template.name,
          content: buffer.toString('base64'),
        };
      }));

      res.status(200).json({ success: true, message: 'Policies generated successfully', policies: generatedPolicies });
    } catch (error) {
      console.error('Error generating policies:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

function generatePolicyNumber() {
  return 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
