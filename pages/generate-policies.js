// pages/generate-policies.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
    const res = await fetch('/api/templates');
    const data = await res.json();
    if (data.success) {
      setTemplates(data.data);
    }
  };

  const handleCommonFieldChange = (e) => {
    const { name, value } = e.target;
    setCommonFields({ ...commonFields, [name]: value });
  };

  const handleTemplateSelection = (e) => {
    const templateId = e.target.value;
    if (e.target.checked) {
      setSelectedTemplates([...selectedTemplates, templateId]);
    } else {
      setSelectedTemplates(selectedTemplates.filter(id => id !== templateId));
    }
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
      const data = await response.json();
      // Handle the response, e.g., provide download links for generated policies
      console.log(data);
    } catch (error) {
      console.error('Error generating policies:', error);
    }
  };

  return (
    <div>
      <h1>Generate Policies</h1>
      <Link href="/">
        <a>Back to Home</a>
      </Link>
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
