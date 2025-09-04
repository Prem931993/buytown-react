import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';

function TaxConfig() {
  const [taxConfigs, setTaxConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tax_name: '',
    tax_rate: '',
    tax_type: 'percentage',
    is_active: true,
    description: ''
  });

  // Fetch tax configurations
  const fetchTaxConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.config.getTaxConfigs();
      setTaxConfigs(response.configs || []);
    } catch (err) {
      setError('Failed to load tax configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxConfigs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.config.createTaxConfig(formData);
      setShowForm(false);
      setFormData({
        tax_name: '',
        tax_rate: '',
        tax_type: 'percentage',
        is_active: true,
        description: ''
      });
      fetchTaxConfigs();
    } catch (err) {
      setError('Failed to create tax configuration');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await adminService.config.deleteTaxConfig(id);
        fetchTaxConfigs();
      } catch (err) {
        setError('Failed to delete tax configuration');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Tax Configuration Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : 'Add Configuration'}
        </button>
      </div>

      {loading && <p>Loading configurations...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>Add Tax Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Tax Name:</label>
              <input
                type="text"
                name="tax_name"
                value={formData.tax_name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Tax Rate (%):</label>
              <input
                type="number"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleInputChange}
                step="0.01"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Tax Type:</label>
              <select
                name="tax_type"
                value={formData.tax_type}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>
          </div>
          <button
            type="submit"
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Save Configuration
          </button>
        </form>
      )}

      <h3>Existing Configurations</h3>
      {taxConfigs.length === 0 ? (
        <p>No tax configurations found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th>ID</th>
              <th>Tax Name</th>
              <th>Tax Rate (%)</th>
              <th>Tax Type</th>
              <th>Active</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxConfigs.map((config) => (
              <tr key={config.id}>
                <td>{config.id}</td>
                <td>{config.tax_name}</td>
                <td>{config.tax_rate}</td>
                <td>{config.tax_type}</td>
                <td>{config.is_active ? 'Yes' : 'No'}</td>
                <td>{config.description || '-'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(config.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TaxConfig;
