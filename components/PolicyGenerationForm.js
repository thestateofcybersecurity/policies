import React, { useState, useEffect } from 'react';

mport React, { useState, useEffect } from 'react';

export default function PolicyGenerationForm() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [policyData, setPolicyData] = useState({
    policy_number: '',
    effective_date: '',
    entity_name: '',
    CISO_equivalent_title: '',
    CIO_equivalent_title: '',
    responsible_department_name: '',
    date_issued: '',
    date_reviewed: '',
    issuer_name: '',
    owner_name: '',
    updated_date: '',
    entity_defined_contact_info: '',
    // Add more fields as needed for specific policies
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPolicyData({ ...policyData, [name]: value });
  };

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/generate-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...policyData, templateId: selectedTemplate }),
      });
      const data = await response.json();
      console.log(data);
      // Handle the response, e.g., provide a download link
    } catch (error) {
      console.error('Error generating policy:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={selectedTemplate} onChange={handleTemplateChange}>
        <option value="">Select a template</option>
        {templates.map((template) => (
          <option key={template._id} value={template._id}>
            {template.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="policy_number"
        value={policyData.policy_number}
        onChange={handleInputChange}
        placeholder="Policy Number"
      />
      <input
        type="date"
        name="effective_date"
        value={policyData.effective_date}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="entity_name"
        value={policyData.entity_name}
        onChange={handleInputChange}
        placeholder="Entity Name"
      />
      <input
        type="text"
        name="CISO_equivalent_title"
        value={policyData.CISO_equivalent_title}
        onChange={handleInputChange}
        placeholder="CISO Equivalent Title"
      />
      <input
        type="text"
        name="CIO_equivalent_title"
        value={policyData.CIO_equivalent_title}
        onChange={handleInputChange}
        placeholder="CIO Equivalent Title"
      />
      <input
        type="text"
        name="responsible_department_name"
        value={policyData.responsible_department_name}
        onChange={handleInputChange}
        placeholder="Responsible Department Name"
      />
      <input
        type="date"
        name="date_issued"
        value={policyData.date_issued}
        onChange={handleInputChange}
      />
      <input
        type="date"
        name="date_reviewed"
        value={policyData.date_reviewed}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="issuer_name"
        value={policyData.issuer_name}
        onChange={handleInputChange}
        placeholder="Issuer Name"
      />
      <input
        type="text"
        name="owner_name"
        value={policyData.owner_name}
        onChange={handleInputChange}
        placeholder="Owner Name"
      />
      <input
        type="date"
        name="updated_date"
        value={policyData.updated_date}
        onChange={handleInputChange}
      />
      <textarea
        name="entity_defined_contact_info"
        value={policyData.entity_defined_contact_info}
        onChange={handleInputChange}
        placeholder="Entity Defined Contact Info"
      />
      {/* Add more fields as needed for specific policies */}
      <button type="submit">Generate Policy</button>
    </form>
  );
}
