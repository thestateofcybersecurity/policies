// src/App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [policyData, setPolicyData] = useState({
    policyName: '',
    entityName: '',
    effectiveDate: '',
    customField1: '',
    customField2: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPolicyData({ ...policyData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/generate-policy', policyData);
      // Handle the response, e.g., download the generated document
      console.log(response.data);
    } catch (error) {
      console.error('Error generating policy:', error);
    }
  };

  return (
    <div className="App">
      <h1>Policy Automation Tool</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Policy Name:</label>
          <input
            type="text"
            name="policyName"
            value={policyData.policyName}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Entity Name:</label>
          <input
            type="text"
            name="entityName"
            value={policyData.entityName}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Effective Date:</label>
          <input
            type="date"
            name="effectiveDate"
            value={policyData.effectiveDate}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Custom Field 1:</label>
          <input
            type="text"
            name="customField1"
            value={policyData.customField1}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Custom Field 2:</label>
          <input
            type="text"
            name="customField2"
            value={policyData.customField2}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Generate Policy</button>
      </form>
    </div>
  );
}

export default App;
