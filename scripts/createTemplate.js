// scripts/createTemplate.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const PolicyTemplate = require('../models/PolicyTemplate');

const templateContent = `
Policy Name: {{policyName}}
Entity Name: {{entityName}}
Effective Date: {{effectiveDate}}

Custom Field 1: {{customField1}}
Custom Field 2: {{customField2}}

[Your policy content here]
`;

async function createTemplate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const template = new PolicyTemplate({
      name: 'Basic Policy Template',
      content: templateContent,
    });

    await template.save();
    console.log('Template created successfully');
  } catch (error) {
    console.error('Error creating template:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTemplate();
