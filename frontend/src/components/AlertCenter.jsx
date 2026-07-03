import React, { useState, useEffect, useRef } from 'react';
import { api } from '../context/AuthContext';
import { Bell, Check, Sparkles, X } from 'lucide-react';

const AlertCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data);
      const unread = res.data.filter(a => !a.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching alerts:', err.message);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll alerts every 20 seconds to feel live
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/alerts/${id}/read`);
      // Update local state smoothly
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: 1 } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking alert as read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/alerts/read-all');
      setAlerts(prev => prev.map(a => ({ ...a, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all alerts read:', err.message);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="alert-center" ref={dropdownRef}>
      <button 
        className={`alert-trigger ${dropdownOpen ? 'active' : ''}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        title="Alert Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
      </button>

      {dropdownOpen && (
        <div className="glass-card alert-dropdown">
          <div className="alert-header">
            <h4>Notification Center</h4>
            {unreadCount > 0 && (
              <button className="btn-text" onClick={handleMarkAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          <div className="alert-list">
            {alerts.length === 0 ? (
              <div className="alert-empty">
                <Sparkles size={20} style={{ color: 'var(--accent-purple)', marginBottom: '0.4rem', opacity: 0.7 }} />
                <p>All quiet! No budget breaches logged.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`alert-item ${!alert.is_read ? 'unread' : ''}`}
                  onClick={() => !alert.is_read && handleMarkAsRead(alert.id)}
                  style={{ cursor: !alert.is_read ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <span>{alert.message}</span>
                    {!alert.is_read && (
                      <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                    )}
                  </div>
                  <span className="alert-item-time">{formatDate(alert.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCenter;
export const triggerAlertRefresh = () => {
  // Can be used to manually invoke an update if desired
};
