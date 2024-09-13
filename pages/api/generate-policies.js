import { connectToDatabase } from '../../utils/dbConnect';
import PolicyTemplate from '../../models/PolicyTemplate';
import HTMLtoDOCX from 'html-to-docx';
import policyFields from '../../utils/policyFields';

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
      
      const { templateIds, commonFields, category } = req.body;
      
      if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or missing templateIds' });
      }

      if (!category || !policyFields[category]) {
        return res.status(400).json({ success: false, message: 'Invalid or missing category' });
      }

      const templates = await PolicyTemplate.find({ _id: { $in: templateIds }, category });

      if (templates.length === 0) {
        return res.status(404).json({ success: false, message: 'No templates found' });
      }

      const batchSize = 5; // Adjust this based on your needs
      const generatedPolicies = [];

      for (let i = 0; i < templates.length; i += batchSize) {
        const batch = templates.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(async (template, index) => {
          let content = template.content;
          
          // Autofill logic for ISO placeholders
          const autofilledFields = autofillISOFields(commonFields, template, index + 1, templates.length);
          
          // Replace common fields and autofilled fields
          Object.entries({ ...policyFields[category], ...autofilledFields }).forEach(([key, value]) => {
            const fieldValue = (typeof value === 'object' ? value.displayName : value) || '';
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), fieldValue);
          });

          const policyNumber = generatePolicyNumber();
          const effectiveDate = new Date().toISOString().split('T')[0];
          
          // Generate unique fields
          content = content.replace(/{{policy_number}}/g, policyNumber);
          content = content.replace(/{{effective_date}}/g, effectiveDate);

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

function autofillISOFields(commonFields, template, currentIndex, totalPolicies) {
  const today = new Date().toISOString().split('T')[0];
  const orgNameAcronym = getAcronym(commonFields.organization_name || '');
  const policyNameAcronym = getAcronym(template.name);
  const scalingNumber = String(currentIndex).padStart(3, '0');

  return {
    document_reference: `${orgNameAcronym}-${policyNameAcronym}-${scalingNumber}`,
    issue_number: '1.0',
    issue_date: today,
    date_of_issue: today,
    change_description: 'Initial Creation of Policy'
  };
}

function getAcronym(str) {
  return str
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}
