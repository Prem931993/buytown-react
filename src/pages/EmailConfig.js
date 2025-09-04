import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';

function EmailConfig() {
  const [emailConfigs, setEmailConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    config_type: 'smtp',
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
    token_expires_at: '',
    enabled: true
  });

  // Fetch email configurations
  const fetchEmailConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.config.getEmailConfigs();
      setEmailConfigs(response.configs || []);
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
      await adminService.config.createEmailConfig(formData);
      setShowForm(false);
      setFormData({
        config_type: 'smtp',
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
        token_expires_at: '',
        enabled: true
      });
      fetchEmailConfigs();
    } catch (err) {
      setError('Failed to create email configuration');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await adminService.config.deleteEmailConfig(id);
        fetchEmailConfigs();
      } catch (err) {
        setError('Failed to delete email configuration');
      }
    }
  };

  const handleToggleEnabled = async (id, currentEnabled) => {
    try {
      await adminService.config.updateEmailConfig(id, { enabled: !currentEnabled });
      fetchEmailConfigs();
    } catch (err) {
      setError('Failed to update configuration status');
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

          {/* Configuration Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <h4>Configuration Type:</h4>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="config_type"
                  value="smtp"
                  checked={formData.config_type === 'smtp'}
                  onChange={handleInputChange}
                />
                SMTP
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="config_type"
                  value="gmail_app_password"
                  checked={formData.config_type === 'gmail_app_password'}
                  onChange={handleInputChange}
                />
                Gmail App Password
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="radio"
                  name="config_type"
                  value="oauth2"
                  checked={formData.config_type === 'oauth2'}
                  onChange={handleInputChange}
                />
                OAuth2
              </label>
            </div>
          </div>

          {/* Common Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
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
          </div>

          {/* Enabled Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleInputChange}
              />
              <span>Enable this configuration for sending emails</span>
            </label>
          </div>

          {/* SMTP Configuration Fields */}
          {(formData.config_type === 'smtp' || formData.config_type === 'gmail_app_password') && (
            <div style={{ marginBottom: '20px' }}>
              <h4>SMTP Configuration:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label>SMTP Host:</label>
                  <input
                    type="text"
                    name="smtp_host"
                    value={formData.smtp_host}
                    onChange={handleInputChange}
                    required
                    placeholder={formData.config_type === 'gmail_app_password' ? 'smtp.gmail.com' : ''}
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
                    placeholder={formData.config_type === 'gmail_app_password' ? '587' : ''}
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
                    placeholder={formData.config_type === 'gmail_app_password' ? 'Your Gmail App Password' : ''}
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
                    SMTP Secure (SSL/TLS)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* OAuth2 Configuration Fields */}
          {formData.config_type === 'oauth2' && (
            <div style={{ marginBottom: '20px' }}>
              <h4>OAuth2 Configuration:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label>Gmail User:</label>
                  <input
                    type="email"
                    name="mail_user"
                    value={formData.mail_user}
                    onChange={handleInputChange}
                    required
                    placeholder="your-email@gmail.com"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>
                <div>
                  <label>Client ID:</label>
                  <input
                    type="text"
                    name="mail_client_id"
                    value={formData.mail_client_id}
                    onChange={handleInputChange}
                    required
                    placeholder="Your Google Client ID"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>
                <div>
                  <label>Client Secret:</label>
                  <input
                    type="password"
                    name="mail_client_secret"
                    value={formData.mail_client_secret}
                    onChange={handleInputChange}
                    required
                    placeholder="Your Google Client Secret"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>
                <div>
                  <label>Refresh Token:</label>
                  <input
                    type="password"
                    name="mail_refresh_token"
                    value={formData.mail_refresh_token}
                    onChange={handleInputChange}
                    required
                    placeholder="Your Google Refresh Token"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label>Access Token:</label>
                  <input
                    type="text"
                    name="mail_access_token"
                    value={formData.mail_access_token}
                    onChange={handleInputChange}
                    placeholder="Access token will be auto-generated"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                  />
                </div>
              </div>
            </div>
          )}

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
        <div style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '5px', marginBottom: '20px' }}>
          <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>⚠️ No Email Configuration Found</h4>
          <p style={{ color: '#856404', margin: '0' }}>
            Email functionality is currently disabled. Password reset emails and other email features will not work until you configure an email service.
          </p>
        </div>
      ) : (
        <>
          {emailConfigs.every(config => !config.enabled) && (
            <div style={{ padding: '15px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px', marginBottom: '20px' }}>
              <h4 style={{ color: '#721c24', margin: '0 0 10px 0' }}>⚠️ All Email Configurations Disabled</h4>
              <p style={{ color: '#721c24', margin: '0' }}>
                All email configurations are currently disabled. Password reset emails and other email features will not work until you enable at least one configuration.
              </p>
            </div>
          )}
          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th>ID</th>
              <th>Type</th>
              <th>From Email</th>
              <th>From Name</th>
              <th>SMTP Host</th>
              <th>SMTP Port</th>
              <th>SMTP User</th>
              <th>Enabled</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {emailConfigs.map((config) => (
              <tr key={config.id}>
                <td>{config.id}</td>
                <td style={{ textTransform: 'capitalize' }}>
                  {config.config_type === 'gmail_app_password' ? 'Gmail App Password' :
                   config.config_type === 'oauth2' ? 'OAuth2' : 'SMTP'}
                </td>
                <td>{config.from_email}</td>
                <td>{config.from_name}</td>
                <td>{config.smtp_host || 'N/A'}</td>
                <td>{config.smtp_port || 'N/A'}</td>
                <td>{config.smtp_user || config.mail_user || 'N/A'}</td>
                <td>
                  <button
                    onClick={() => handleToggleEnabled(config.id, config.enabled)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: config.enabled ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>
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
        </>
      )}
    </div>
  );
}

export default EmailConfig;
