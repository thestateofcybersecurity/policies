// pages/manage-templates.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ManageTemplates() {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '', type: 'html' });
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
      setNewTemplate({ name: '', content: '' });
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
        <a>Back to Policy Generation</a>
      </Link>
      <h2>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={editingTemplate ? editingTemplate.name : newTemplate.name}
          onChange={handleInputChange}
          placeholder="Template Name"
          required
        />
        <select
          name="type"
          value={editingTemplate ? editingTemplate.type : newTemplate.type}
          onChange={handleInputChange}
        >
          <option value="html">HTML</option>
          <option value="text">Plain Text</option>
        </select>
        <textarea
          name="content"
          value={editingTemplate ? editingTemplate.content : newTemplate.content}
          onChange={handleInputChange}
          placeholder="Template Content (HTML or Plain Text)"
          required
        />
        <button type="submit">{editingTemplate ? 'Update Template' : 'Create Template'}</button>
        {editingTemplate && <button type="button" onClick={cancelEditing}>Cancel Editing</button>}
      </form>
      <h2>Existing Templates</h2>
      <ul>
        {templates.map((template) => (
          <li key={template._id}>
            {template.name}
            <button onClick={() => startEditing(template)}>Edit</button>
            <button onClick={() => deleteTemplate(template._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
