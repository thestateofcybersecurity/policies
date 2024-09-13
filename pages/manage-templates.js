import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function ManageTemplates() {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '', type: 'html', category: 'NIST CSF' });
  const [editingTemplate, setEditingTemplate] = useState(null);

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
    if (editingTemplate) {
      setEditingTemplate({ ...editingTemplate, [name]: value });
    } else {
      setNewTemplate({ ...newTemplate, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const templateToSave = editingTemplate || newTemplate;
    const method = editingTemplate ? 'PUT' : 'POST';
    const url = editingTemplate ? `/api/templates/${editingTemplate._id}` : '/api/templates';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateToSave),
    });

    if (res.ok) {
      fetchTemplates();
      setNewTemplate({ name: '', content: '', type: 'html', category: 'NIST CSF' });
      setEditingTemplate(null);
    }
  };

  const deleteTemplate = async (id) => {
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchTemplates();
    }
  };

  const startEditing = (template) => {
    setEditingTemplate(template);
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
  };

  return (
    <div>
      <h1>Manage Templates</h1>
      <Link href="/">
        <a className="btn mb-4">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Policy Generation
        </a>
      </Link>
      <h2>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h2>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="name">Template Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={editingTemplate ? editingTemplate.name : newTemplate.name}
            onChange={handleInputChange}
            placeholder="Template Name"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="type">Template Type</label>
          <select
            id="type"
            name="type"
            value={editingTemplate ? editingTemplate.type : newTemplate.type}
            onChange={handleInputChange}
          >
            <option value="html">HTML</option>
            <option value="text">Plain Text</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="category">Template Category</label>
          <select
            id="category"
            name="category"
            value={editingTemplate ? editingTemplate.category : newTemplate.category}
            onChange={handleInputChange}
          >
            <option value="NIST CSF">NIST CSF</option>
            <option value="ISO 27001">ISO 27001</option>
                <option value="CIS IG1">CIS IG1</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="content">Template Content</label>
          <textarea
            id="content"
            name="content"
            value={editingTemplate ? editingTemplate.content : newTemplate.content}
            onChange={handleInputChange}
            placeholder="Template Content (HTML or Plain Text)"
            required
            rows="10"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn">
            <FontAwesomeIcon icon={faSave} /> {editingTemplate ? 'Update Template' : 'Create Template'}
          </button>
          {editingTemplate && (
            <button type="button" onClick={cancelEditing} className="btn bg-gray-600 hover:bg-gray-700">
              <FontAwesomeIcon icon={faTimes} /> Cancel Editing
            </button>
          )}
        </div>
      </form>
      <h2>Existing Templates</h2>
      <ul className="space-y-2">
        {templates.map((template) => (
          <li key={template._id} className="flex items-center justify-between bg-gray-800 p-4 rounded-md">
            <span>{template.name} ({template.category})</span>
            <div className="flex gap-2">
              <button onClick={() => startEditing(template)} className="btn">
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button onClick={() => deleteTemplate(template._id)} className="btn bg-red-600 hover:bg-red-700">
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
