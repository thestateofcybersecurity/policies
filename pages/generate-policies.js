// pages/api/generate-policies.js
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../utils/mongodb';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const { templateIds, commonFields } = req.body;

      // Convert string IDs to ObjectId
      const objectIds = templateIds.map(id => new ObjectId(id));

      const templates = await db.collection('templates').find({ _id: { $in: objectIds } }).toArray();

      if (templates.length === 0) {
        return res.status(404).json({ success: false, message: 'No templates found' });
      }

      const browser = await puppeteer.launch(chromium.executablePath ? {
        args: [...chromium.args, '--no-sandbox'],
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      } : {});

      const generatedPolicies = await Promise.all(templates.map(async (template) => {
        let content = template.content;
        
        // Replace common fields
        Object.entries(commonFields).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
        });

        // Generate unique fields
        const uniqueFields = {
          policy_number: generatePolicyNumber(),
          effective_date: new Date().toISOString().split('T')[0],
          date_issued: new Date().toISOString().split('T')[0],
          date_reviewed: new Date().toISOString().split('T')[0],
          updated_date: new Date().toISOString().split('T')[0],
        };

        Object.entries(uniqueFields).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        const page = await browser.newPage();
        await page.setContent(content, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ 
          format: 'A4', 
          printBackground: true,
          margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
        });
        await page.close();

        return {
          name: template.name,
          pdf: pdf.toString('base64'),
        };
      }));

      await browser.close();

      res.status(200).json({ success: true, policies: generatedPolicies });
    } catch (error) {
      console.error('Error generating policies:', error);
      res.status(500).json({ success: false, message: 'Error generating policies', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

function generatePolicyNumber() {
  return 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
