import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSync, faCheck, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import policyFields from '../utils/policyFields';

export default function GeneratePolicies() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [commonFields, setCommonFields] = useState({});
  const [generatedPolicies, setGeneratedPolicies] = useState([]);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('NIST CSF');

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Initialize commonFields with empty strings for the selected category
    setCommonFields(
      Object.keys(policyFields[selectedCategory]).reduce((acc, field) => {
        acc[field] = '';
        return acc;
      }, {})
    );
    setSelectedTemplates([]); // Clear selected templates when category changes
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to fetch templates. Please try again.');
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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTemplates(filteredTemplates.map(template => template._id));
    } else {
      setSelectedTemplates([]);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setGeneratedPolicies([]);
    setIsGenerating(true);
    setProgress(0);

    try {
      const response = await fetch('/api/generate-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds: selectedTemplates, commonFields, category: selectedCategory }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setGeneratedPolicies(data.policies);
        alert('Policies generated successfully!');
      } else {
        throw new Error(data.message || 'Failed to generate policies');
      }
    } catch (error) {
      console.error('Error generating policies:', error);
      setError('Failed to generate policies. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  };

  const downloadPolicy = (policy) => {
    // Decode the base64 string
    const binaryString = atob(policy.content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create Blob with the binary data
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Create a link element, set the download attribute with a .docx extension
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${policy.name}.docx`;

    // Append to the document, click and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllPolicies = () => {
    generatedPolicies.forEach(policy => downloadPolicy(policy));
  };

  const filteredTemplates = templates.filter(template => template.category === selectedCategory);
  
  return (
    <div>
      <h1>Generate Policies</h1>
      <Link href="/">
        <a className="btn">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Home
        </a>
      </Link>
      <form onSubmit={handleSubmit}>
        <h2>Common Fields</h2>
        {Object.entries(policyFields[selectedCategory]).map(([name, { displayName, explanation }]) => (
          <div key={name} className="policy-field">
            <label htmlFor={name}>{displayName}</label>
            <input
              type="text"
              id={name}
              name={name}
              value={commonFields[name] || ''}
              onChange={handleCommonFieldChange}
              placeholder={displayName}
            />
            <p className="field-description">{explanation}</p>
          </div>
        ))}
        <h2>Select Policy Category</h2>
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="NIST CSF">NIST CSF</option>
          <option value="ISO 27001">ISO 27001</option>
        </select>
        <h2>Select Policies to Generate</h2>
        <div>
          <label>
            <input
              type="checkbox"
              checked={selectedTemplates.length === filteredTemplates.length}
              onChange={handleSelectAll}
            />
            <FontAwesomeIcon icon={faCheck} /> Select All
          </label>
        </div>
        {filteredTemplates.map((template) => (
          <div key={template._id}>
            <label>
              <input
                type="checkbox"
                value={template._id}
                onChange={handleTemplateSelection}
                checked={selectedTemplates.includes(template._id)}
              />
              {template.name}
            </label>
          </div>
        ))}
        <button type="submit">
          <FontAwesomeIcon icon={faSync} /> Generate Selected Policies
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {generatedPolicies.length > 0 && (
        <div>
          <h2>Generated Policies</h2>
          <button onClick={downloadAllPolicies}>
            <FontAwesomeIcon icon={faDownload} /> Download All Policies
          </button>
          <ul>
            {generatedPolicies.map((policy, index) => (
              <li key={index}>
                {policy.name} 
                <button onClick={() => downloadPolicy(policy)}>
                  <FontAwesomeIcon icon={faDownload} /> Download DOCX
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {isGenerating && (
        <div>
          <progress value={progress} max={100}></progress>
          <p>{progress}% complete</p>
        </div>
      )}
    </div>
  );
}
