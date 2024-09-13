import { connectToDatabase } from '../../utils/dbConnect';
import PolicyTemplate from '../../models/PolicyTemplate';
import HTMLtoDOCX from 'html-to-docx';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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

      const batchSize = 5; // Adjust this based on your needs
      const generatedPolicies = [];

      for (let i = 0; i < templates.length; i += batchSize) {
        const batch = templates.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(async (template) => {
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

          // Convert HTML to DOCX
          const docxBuffer = await HTMLtoDOCX(content, null, {
            table: { row: { cantSplit: true } },
            footer: true,
            pageNumber: true,
          });

          return {
            name: template.name,
            content: docxBuffer.toString('base64'),
          };
        }));

        generatedPolicies.push(...batchResults);
      }

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
