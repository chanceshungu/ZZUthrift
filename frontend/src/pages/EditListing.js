import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'Clothing',
    condition: 'Good', type: 'Sell', location: '', image: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get(`${API}/listings/${id}`)
      .then(res => {
        const l = res.data;
        setForm({
          title: l.title || '',
          description: l.description || '',
          price: l.price || '',
          category: l.category || 'Clothing',
          condition: l.condition || 'Good',
          type: l.type || 'Sell',
          location: l.location || '',
          image: (l.images && l.images[0]) || ''
        });
      })
      .catch(() => setError('Failed to load listing'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Image must be under 5MB');
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, images: form.image ? [form.image] : [] };
      delete payload.image;
      await axios.put(`${API}/listings/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/listing/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing');
    }
    setSaving(false);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="create-page">
      <h2>Edit Listing</h2>
      <div className="create-card">
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title" placeholder="What are you selling?"
              value={form.title} onChange={handleChange} required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description" placeholder="Describe your item — condition, size, details..."
              value={form.description} onChange={handleChange} required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Clothing</option>
                <option>Textbooks</option>
                <option>Dorm Essentials</option>
                <option>Electronics</option>
                <option>Furniture</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Condition *</label>
              <select name="condition" value={form.condition} onChange={handleChange}>
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Listing Type *</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Sell</option>
                <option>Trade</option>
                <option>Free</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price ($) {form.type !== 'Sell' ? '(optional)' : '*'}</label>
              <input
                type="number" name="price" placeholder="0.00" min="0" step="0.01"
                value={form.price} onChange={handleChange}
                required={form.type === 'Sell'}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              name="location" placeholder="e.g. Orton Hall, Engineering Library..."
              value={form.location} onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Photo (optional — upload new to replace)</label>
            <input type="file" accept="image/*" onChange={handleImage} />
            {form.image
              ? <img src={form.image} alt="Preview" className="image-preview" />
              : <div className="image-placeholder">No photo</div>
            }
          </div>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditListing;
