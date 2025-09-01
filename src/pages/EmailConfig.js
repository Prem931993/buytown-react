import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EmailConfig() {
  const [emailConfigs, setEmailConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: '',
    smtp_secure: false,
    from_email: '',
    from_name: '',
    mail_user: '',
    mail_client_id: '',
    mail_client_secret: '',
    mail_refresh_token: '',
    mail_access_token: '',
    token_expires_at: ''
  });

  // Fetch email configurations
  const fetchEmailConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/config/email-configs');
      setEmailConfigs(response.data.configs || []);
    } catch (err) {
      setError('Failed to load email configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailConfigs();
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
      await axios.post('/config/email-configs', formData);
      setShowForm(false);
      setFormData({
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_password: '',
        smtp_secure: false,
        from_email: '',
        from_name: '',
        mail_user: '',
        mail_client_id: '',
        mail_client_secret: '',
        mail_refresh_token: '',
        mail_access_token: '',
        token_expires_at: ''
      });
      fetchEmailConfigs();
    } catch (err) {
      setError('Failed to create email configuration');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await axios.delete(`/config/email-configs/${id}`);
        fetchEmailConfigs();
      } catch (err) {
        setError('Failed to delete email configuration');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Email Configuration Management</h2>
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
          <h3>Add Email Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>SMTP Host:</label>
              <input
                type="text"
                name="smtp_host"
                value={formData.smtp_host}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>SMTP Port:</label>
              <input
                type="number"
                name="smtp_port"
                value={formData.smtp_port}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>SMTP User:</label>
              <input
                type="text"
                name="smtp_user"
                value={formData.smtp_user}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>SMTP Password:</label>
              <input
                type="password"
                name="smtp_password"
                value={formData.smtp_password}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>From Email:</label>
              <input
                type="email"
                name="from_email"
                value={formData.from_email}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div>
              <label>From Name:</label>
              <input
                type="text"
                name="from_name"
                value={formData.from_name}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>
                <input
                  type="checkbox"
                  name="smtp_secure"
                  checked={formData.smtp_secure}
                  onChange={handleInputChange}
                />
                SMTP Secure
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
      {emailConfigs.length === 0 ? (
        <p>No email configurations found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th>ID</th>
              <th>SMTP Host</th>
              <th>SMTP Port</th>
              <th>SMTP User</th>
              <th>From Email</th>
              <th>From Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {emailConfigs.map((config) => (
              <tr key={config.id}>
                <td>{config.id}</td>
                <td>{config.smtp_host}</td>
                <td>{config.smtp_port}</td>
                <td>{config.smtp_user}</td>
                <td>{config.from_email}</td>
                <td>{config.from_name}</td>
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

export default EmailConfig;
