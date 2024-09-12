// pages/api/generate-policies.js
import { connectToDatabase } from '../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const { templateIds, commonFields } = req.body;

      const templates = await db.collection('templates').find({ _id: { $in: templateIds } }).toArray();

      const generatedPolicies = templates.map(template => {
        let content = template.content;
        
        // Replace common fields
        Object.entries(commonFields).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        // Generate unique fields
        content = content.replace(/{{policy_number}}/g, generatePolicyNumber());
        content = content.replace(/{{effective_date}}/g, new Date().toISOString().split('T')[0]);
        content = content.replace(/{{date_issued}}/g, new Date().toISOString().split('T')[0]);
        content = content.replace(/{{date_reviewed}}/g, new Date().toISOString().split('T')[0]);
        content = content.replace(/{{updated_date}}/g, new Date().toISOString().split('T')[0]);

        return {
          name: template.name,
          content: content,
        };
      });

      // Here you would typically save the generated policies or prepare them for download
      // For this example, we'll just send them back in the response

      res.status(200).json({ success: true, policies: generatedPolicies });
    } catch (error) {
      console.error('Error generating policies:', error);
      res.status(500).json({ success: false, message: 'Error generating policies' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

function generatePolicyNumber() {
  // Implement your policy number generation logic here
  return 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
