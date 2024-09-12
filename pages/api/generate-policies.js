// pages/api/generate-policies.js
import { connectToDatabase } from '../../utils/mongodb';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase();
      const { templateIds, commonFields } = req.body;

      const templates = await db.collection('templates').find({ _id: { $in: templateIds } }).toArray();

      const browser = await puppeteer.launch(chromium.executablePath ? {
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      } : {});

      const generatedPolicies = await Promise.all(templates.map(async (template) => {
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

        const page = await browser.newPage();
        await page.setContent(content, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true });
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
      res.status(500).json({ success: false, message: 'Error generating policies' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

function generatePolicyNumber() {
  return 'POL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}
