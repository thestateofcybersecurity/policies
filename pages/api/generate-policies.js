// pages/api/generate-policies.js
import { connectToDatabase } from '../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const { templateIds, commonFields } = req.body;

      const objectIds = templateIds.map(id => new ObjectId(id));
      const templates = await db.collection('templates').find({ _id: { $in: objectIds } }).toArray();

      if (templates.length === 0) {
        return res.status(404).json({ success: false, message: 'No templates found' });
      }

      const generatedPolicies = templates.map((template) => {
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

        return {
          name: template.name,
          content: content,
        };
      });

      // Here you would typically save the generated policies or prepare them for download
      // For this example, we'll just send a success message

      res.status(200).json({ success: true, message: 'Policies generated successfully', policies: generatedPolicies });
    } catch (error) {
      console.error('Error in generate-policies:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

function generatePolicyNumber() {
  return 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
