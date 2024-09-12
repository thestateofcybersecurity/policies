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
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/templates');
        const data = await res.json();
        if (data.success) {
          setTemplates(data.data);
        } else {
          console.error('Failed to fetch templates:', data.message);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/generate-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds: selectedTemplates, commonFields }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        alert('Policies generated successfully!');
      } else {
        throw new Error(data.message || 'Failed to generate policies');
      }
    } catch (error) {
      console.error('Error generating policies:', error);
      alert('Failed to generate policies. Please try again.');
    }
  };
  
  return (
    <div>
      <h1>Generate Policies</h1>
      <Link href="/">Back to Home</Link>
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
