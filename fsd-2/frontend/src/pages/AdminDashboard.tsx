import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [communities, setCommunities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    collegeName: '',
    description: '',
    category: 'other'
  });

  useEffect(() => {
    fetchMyCommunities();
    fetchAdminStats();
  }, []);

  const fetchMyCommunities = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/communities/admin/my-communities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunities(response.data);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/users/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/communities`, newCommunity, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNewCommunity({ name: '', collegeName: '', description: '', category: 'other' });
      fetchMyCommunities();
      alert('Community created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create community');
    }
  };

  const tabs = ['overview', 'communities', 'create-community', 'analytics'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return stats ? (
          <div>
            <h3>Dashboard Overview</h3>
            <div className="grid grid-stats" style={{ marginTop: '1.5rem' }}>
              <div className="stat-card" style={{ '--bg-from': '#3b82f6', '--bg-to': '#2563eb' } as any}>
                <h2>{stats.totalUsers}</h2>
                <p>Total Students</p>
              </div>
              <div className="stat-card" style={{ '--bg-from': '#10b981', '--bg-to': '#059669' } as any}>
                <h2>{stats.myEvents}</h2>
                <p>My Events</p>
              </div>
              <div className="stat-card" style={{ '--bg-from': '#f59e0b', '--bg-to': '#d97706' } as any}>
                <h2>{stats.myMembers}</h2>
                <p>Community Members</p>
              </div>
              <div className="stat-card" style={{ '--bg-from': '#ef4444', '--bg-to': '#dc2626' } as any}>
                <h2>{stats.totalCommunities}</h2>
                <p>Total Communities</p>
              </div>
            </div>
          </div>
        ) : <div className="loading">Loading stats...</div>;

      case 'communities':
        return (
          <div>
            <h3>My Communities ({communities.length})</h3>
            <div className="grid grid-auto" style={{ marginTop: '1.5rem' }}>
              {communities.map((community: any) => (
                <div key={community._id} className="card">
                  <h4>{community.name}</h4>
                  <p>College: {community.collegeName}</p>
                  <p>Category: {community.category}</p>
                  <p>Description: {community.description}</p>
                  
                  <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-active">
                        {community.stats?.totalMembers || 0} Members
                      </span>
                      <span className="badge badge-upcoming">
                        {community.stats?.totalEvents || 0} Events
                      </span>
                      <span className="badge badge-completed">
                        {community.stats?.pendingQueries || 0} Pending Queries
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => navigate(`/community/${community._id}`)}
                      className="btn-primary" 
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      Manage
                    </button>
                    <button 
                      onClick={() => navigate(`/attendance/${community._id}`)}
                      className="btn-secondary" 
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      Track Attendance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'create-community':
        return (
          <div>
            <h3>Create New Community</h3>
            <div className="card" style={{ maxWidth: '600px', marginTop: '1.5rem' }}>
              <form onSubmit={handleCreateCommunity}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={newCommunity.name}
                    onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                    required
                    className="input-field"
                    placeholder="e.g., Tech Innovators Community"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    College Name
                  </label>
                  <input
                    type="text"
                    value={newCommunity.collegeName}
                    onChange={(e) => setNewCommunity({ ...newCommunity, collegeName: e.target.value })}
                    required
                    className="input-field"
                    placeholder="e.g., MIT College of Engineering"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Category
                  </label>
                  <select
                    value={newCommunity.category}
                    onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="technology">Technology</option>
                    <option value="science">Science</option>
                    <option value="arts">Arts</option>
                    <option value="sports">Sports</option>
                    <option value="business">Business</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Description
                  </label>
                  <textarea
                    value={newCommunity.description}
                    onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                    className="input-field"
                    rows={4}
                    placeholder="Describe your community's purpose and goals..."
                  />
                </div>

                <button type="submit" className="btn-primary">
                  Create Community
                </button>
              </form>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div>
            <h3>Analytics & Reports</h3>
            <div className="grid grid-auto" style={{ marginTop: '1.5rem' }}>
              {communities.map((community: any) => (
                <div key={community._id} className="card">
                  <h4>{community.name}</h4>
                  <div style={{ marginTop: '1rem' }}>
                    <p>📊 Total Members: {community.stats?.totalMembers || 0}</p>
                    <p>🎉 Total Events: {community.stats?.totalEvents || 0}</p>
                    <p>❓ Total Queries: {community.stats?.totalQueries || 0}</p>
                    <p>⏳ Pending Queries: {community.stats?.pendingQueries || 0}</p>
                    <p>💬 Chat Messages: {community.stats?.totalMessages || 0}</p>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#e5e7eb', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${Math.min((community.stats?.totalMembers || 0) * 2, 100)}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Member Growth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="card-header">
        <div className="flex-between">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your communities, events, and members</p>
          </div>
          <div className="avatar">
            A
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;