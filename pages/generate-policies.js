// pages/generate-policies.js
import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default function GeneratePolicies() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [commonFields, setCommonFields] = useState({
    entity_name: '',
    CISO_equivalent_title: '',
    CIO_equivalent_title: '',
    responsible_department_name: '',
    issuer_name: '',
    owner_name: '',
    entity_defined_contact_info: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCommonFieldChange = (e) => {
    const { name, value } = e.target;
    setCommonFields(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelection = (e) => {
    const templateId = e.target.value;
    setSelectedTemplates(prev => 
      e.target.checked
        ? [...prev, templateId]
        : prev.filter(id => id !== templateId)
    );
  };

  const generatePDF = async (policyData) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(policyData.title, {
      x: 50,
      y: height - 50,
      size: 20,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Add more content to the PDF here...

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/generate-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateIds: selectedTemplates,
          commonFields,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Generate PDFs on the client side
        const generatedPolicies = await Promise.all(
          data.policies.map(async (policy) => {
            const pdfBytes = await generatePDF(policy);
            return {
              name: policy.name,
              pdf: pdfBytes,
            };
          })
        );

        // Trigger downloads
        generatedPolicies.forEach(policy => {
          const blob = new Blob([policy.pdf], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${policy.name}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      } else {
        throw new Error(data.message || 'Failed to generate policies');
      }
    } catch (error) {
      console.error('Error generating policies:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div>
      <h1>Generate Policies</h1>
      <form onSubmit={handleSubmit}>
        <h2>Common Fields</h2>
        {Object.entries(commonFields).map(([name, value]) => (
          <div key={name}>
            <label htmlFor={name}>{name.replace(/_/g, ' ')}</label>
            <input
              type="text"
              id={name}
              name={name}
              value={value}
              onChange={handleCommonFieldChange}
            />
          </div>
        ))}
        <h2>Select Policies to Generate</h2>
        {templates.map((template) => (
          <div key={template._id}>
            <input
              type="checkbox"
              id={template._id}
              value={template._id}
              onChange={handleTemplateSelection}
            />
            <label htmlFor={template._id}>{template.name}</label>
          </div>
        ))}
        <button type="submit">Generate Selected Policies</button>
      </form>
    </div>
  );
}
