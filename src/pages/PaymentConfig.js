import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PaymentConfig() {
  const [paymentConfigs, setPaymentConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    gateway_name: '',
    api_key: '',
    api_secret: '',
    webhook_secret: '',
    is_active: true,
    is_sandbox: true,
    currency: 'INR',
    description: ''
  });

  // Fetch payment configurations
  const fetchPaymentConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/config/payment-configs');
      setPaymentConfigs(response.data.configs || []);
    } catch (err) {
      setError('Failed to load payment configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentConfigs();
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
      await axios.post('/config/payment-configs', formData);
      setShowForm(false);
      setFormData({
        gateway_name: '',
        api_key: '',
        api_secret: '',
        webhook_secret: '',
        is_active: true,
        is_sandbox: true,
        currency: 'INR',
        description: ''
      });
      fetchPaymentConfigs();
    } catch (err) {
      setError('Failed to create payment configuration');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await axios.delete(`/config/payment-configs/${id}`);
        fetchPaymentConfigs();
      } catch (err) {
        setError('Failed to delete payment configuration');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Payment Configuration Management</h2>
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
          <h3>Add Payment Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Gateway Name:</label>
              <input
                type="text"
                name="gateway_name"
                value={formData.gateway_name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>API Key:</label>
              <input
                type="text"
                name="api_key"
                value={formData.api_key}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>API Secret:</label>
              <input
                type="password"
                name="api_secret"
                value={formData.api_secret}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Webhook Secret:</label>
              <input
                type="text"
                name="webhook_secret"
                value={formData.webhook_secret}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>Currency:</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
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
            <div>
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
            <div>
              <label>
                <input
                  type="checkbox"
                  name="is_sandbox"
                  checked={formData.is_sandbox}
                  onChange={handleInputChange}
                />
                Sandbox Mode
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
      {paymentConfigs.length === 0 ? (
        <p>No payment configurations found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th>ID</th>
              <th>Gateway Name</th>
              <th>API Key</th>
              <th>Active</th>
              <th>Sandbox</th>
              <th>Currency</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentConfigs.map((config) => (
              <tr key={config.id}>
                <td>{config.id}</td>
                <td>{config.gateway_name}</td>
                <td>{config.api_key}</td>
                <td>{config.is_active ? 'Yes' : 'No'}</td>
                <td>{config.is_sandbox ? 'Yes' : 'No'}</td>
                <td>{config.currency}</td>
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

export default PaymentConfig;
