// pages/api/generate-policies.js
import { connectToDatabase } from '../../utils/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  console.log('Received request:', req.method, req.url);
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      console.log('Connected to database');

      if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or missing templateIds' });
      }

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

      console.log('Policies generated successfully');
      res.status(200).json({ success: true, message: 'Policies generated successfully' });
    } catch (error) {
      console.error('Error generating policies:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    console.log('Method not allowed');
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

function generatePolicyNumber() {
  return 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
