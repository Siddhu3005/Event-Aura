import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getRole } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Community {
  _id: string;
  name: string;
  collegeName: string;
  category: string;
  members: any[];
  events: any[];
}

const CommunityHub: React.FC = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [activeChannel, setActiveChannel] = useState('general');
  const [communityData, setCommunityData] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'joined' | 'all'>('joined');
  const [newMessage, setNewMessage] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', pinned: false });
  const [newQuery, setNewQuery] = useState({ issueType: 'general', description: '' });
  const [newFeedback, setNewFeedback] = useState({ rating: '5', content: '' });
  const role = getRole();

  useEffect(() => {
    fetchUserCommunities();
    fetchAllCommunities();
    
    // Listen for event updates
    const handleEventUpdate = () => {
      fetchUserCommunities();
      fetchAllCommunities();
      if (selectedCommunity) {
        fetchCommunityData(selectedCommunity._id);
      }
    };
    
    window.addEventListener('eventUpdated', handleEventUpdate);
    return () => window.removeEventListener('eventUpdated', handleEventUpdate);
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityData(selectedCommunity._id);
    }
  }, [selectedCommunity]);

  const fetchUserCommunities = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommunities(response.data.user.communitiesJoined || []);
      if (response.data.user.communitiesJoined?.length > 0) {
        setSelectedCommunity(response.data.user.communitiesJoined[0]);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchAllCommunities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/communities`);
      setAllCommunities(response.data);
    } catch (error) {
      console.error('Error fetching all communities:', error);
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/communities/${communityId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh data after joining
      await fetchUserCommunities();
      await fetchAllCommunities();
      
      // Trigger profile refresh if on profile page
      window.dispatchEvent(new CustomEvent('profileUpdate'));
      
      alert('Joined community successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join community');
    }
  };

  const fetchCommunityData = async (communityId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/communities/${communityId}`);
      setCommunityData(response.data);
    } catch (error) {
      console.error('Error fetching community data:', error);
    }
  };

  const postAnnouncement = async () => {
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/communities/${selectedCommunity?._id}/announcements`, 
        newAnnouncement,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAnnouncement({ title: '', content: '', pinned: false });
      fetchCommunityData(selectedCommunity!._id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to post announcement');
    }
  };

  const postMessage = async (channel: string) => {
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/communities/${selectedCommunity?._id}/chat`, 
        { message: newMessage, messageType: channel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchCommunityData(selectedCommunity!._id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  const submitQuery = async () => {
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/queries`, 
        { 
          communityId: selectedCommunity?._id,
          issueType: newQuery.issueType,
          description: newQuery.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewQuery({ issueType: 'general', description: '' });
      fetchCommunityData(selectedCommunity!._id);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit query');
    }
  };

  interface ChannelItem {
    id: string;
    name: string;
    type: string;
    icon: string;
    adminOnly?: boolean;
  }

  const channelCategories: Record<string, ChannelItem[]> = {
    text: [
      { id: 'general', name: 'general', type: 'text', icon: '💬' },
      { id: 'introductions', name: 'introductions', type: 'text', icon: '👋' }
    ],
    events: [
      { id: 'upcoming-events', name: 'Upcoming Events', type: 'event', icon: '🎉' },
      { id: 'past-events', name: 'Past Events', type: 'event', icon: '📅' }
    ],
    support: [
      { id: 'support', name: 'support', type: 'query', icon: '❓' },
      { id: 'feedback', name: 'feedback', type: 'query', icon: '💭' }
    ],
    admin: [
      { id: 'announcements', name: 'updates', type: 'announcement', icon: '📢', adminOnly: true }
    ]
  };

  const renderChannelContent = () => {
    if (!communityData) return <div className="loading">Loading...</div>;

    switch (activeChannel) {
      case 'general':
        return (
          <div style={{ padding: '1.5rem' }}>
            <h2>Welcome to {selectedCommunity?.name}</h2>
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3>Community Guidelines</h3>
              <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                <li>Be respectful to all members</li>
                <li>Keep discussions relevant to the community</li>
                <li>No spam or promotional content</li>
                <li>Use appropriate channels for different topics</li>
              </ul>
            </div>
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3>Quick Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4f46e5' }}>
                    {communityData.community.members?.length || 0}
                  </div>
                  <div>Members</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {communityData.community.events?.length || 0}
                  </div>
                  <div>Events</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {communityData.queries?.filter((q: any) => q.status === 'open').length || 0}
                  </div>
                  <div>Open Queries</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'introductions':
        return (
          <div style={{ padding: '1.5rem', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '1rem' }}>👋 Introductions</h2>
            <div style={{ 
              flex: 1, 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '0.5rem', 
              padding: '1rem',
              overflowY: 'auto',
              marginBottom: '1rem',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}>
              {communityData.chatMessages?.filter((msg: any) => msg.messageType === 'introductions').map((msg: any) => (
                <div key={msg._id} style={{ 
                  marginBottom: '1rem', 
                  padding: '0.75rem', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '0.5rem' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#4f46e5' }}>{msg.userId?.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{msg.message}</p>
                </div>
              )) || <p style={{ textAlign: 'center', color: '#6b7280' }}>Welcome new members! Introduce yourself here.</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Introduce yourself to the community..."
                className="input-field"
                style={{ flex: 1 }}
              />
              <button onClick={() => postMessage('introductions')} className="btn-primary">Post</button>
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div style={{ padding: '1.5rem', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>📢 Announcements</h2>
              {role === 'student' && (
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                  View Only
                </span>
              )}
            </div>
            <div style={{ 
              flex: 1, 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '0.5rem', 
              padding: '1rem',
              overflowY: 'auto',
              marginBottom: '1rem',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}>
              {communityData.community.announcements?.map((announcement: any) => (
                <div key={announcement._id} style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  backgroundColor: 'rgba(79, 70, 229, 0.1)', 
                  borderRadius: '0.5rem',
                  borderLeft: '4px solid #4f46e5'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: '#4f46e5' }}>📢 {announcement.createdBy?.name}</strong>
                      {announcement.pinned && <span className="badge badge-active">📌 Pinned</span>}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {new Date(announcement.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>{announcement.title}</h4>
                  <p>{announcement.content}</p>
                </div>
              )) || <p style={{ textAlign: 'center', color: '#6b7280' }}>No announcements yet.</p>}
            </div>
            {role === 'admin' && (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    placeholder="Announcement title..."
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'white' }}>
                    <input 
                      type="checkbox" 
                      checked={newAnnouncement.pinned}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
                    /> Pin
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    placeholder="Type announcement about events, changes, updates..."
                    className="input-field"
                    style={{ flex: 1, minHeight: '60px', resize: 'vertical' }}
                  />
                  <button onClick={postAnnouncement} className="btn-primary">Post</button>
                </div>
              </div>
            )}
          </div>
        );

      case 'upcoming-events':
        return (
          <div style={{ padding: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2>🎉 Upcoming Events</h2>
              {role === 'admin' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => navigate(`/community/${selectedCommunity?._id}/create-event`)}
                    className="btn-primary"
                  >
                    Create Event
                  </button>
                  <button 
                    onClick={() => navigate(`/community/${selectedCommunity?._id}/manage-members`)}
                    className="btn-secondary"
                  >
                    Manage Members
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-auto">
              {communityData.community.events?.filter((event: any) => new Date(event.startDate) > new Date()).map((event: any) => (
                <div key={event._id} className="card">
                  <h3>{event.name}</h3>
                  <div style={{ margin: '1rem 0' }}>
                    <p><strong>Theme:</strong> {event.theme}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {new Date(event.startDate).toLocaleTimeString()}</p>
                  </div>
                  {event.prizes?.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Prizes:</strong>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {event.prizes.map((prize: any, index: number) => (
                          <span key={index} className="badge badge-active">
                            {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'} ₹{prize.amount}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => navigate(`/event/${event._id}`)}
                      className="btn-primary"
                    >
                      View Details
                    </button>
                    {role === 'admin' && new Date() < new Date(event.startDate) && (
                      <button 
                        onClick={() => navigate(`/event/${event._id}/edit`)}
                        className="btn-secondary"
                      >
                        Edit
                      </button>
                    )}
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {event.participants?.length || 0} registered
                    </span>
                  </div>
                </div>
              )) || <p>No upcoming events.</p>}
            </div>
          </div>
        );

      case 'past-events':
        return (
          <div style={{ padding: '1.5rem' }}>
            <h2>📅 Past Events</h2>
            <div className="grid grid-auto" style={{ marginTop: '1.5rem' }}>
              {communityData.community.events?.filter((event: any) => new Date(event.endDate) < new Date()).map((event: any) => (
                <div key={event._id} className="card">
                  <h3>{event.name}</h3>
                  <div style={{ margin: '1rem 0' }}>
                    <p><strong>Theme:</strong> {event.theme}</p>
                    <p><strong>Completed:</strong> {new Date(event.endDate).toLocaleDateString()}</p>
                    <p><strong>Participants:</strong> {event.participants?.length || 0}</p>
                  </div>
                  <span className="badge badge-completed">Completed</span>
                </div>
              )) || <p>No past events.</p>}
            </div>
          </div>
        );

      case 'support':
        return (
          <div style={{ padding: '1.5rem', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '1rem' }}>❓ Support</h2>
            <div style={{ 
              flex: 1, 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '0.5rem', 
              padding: '1rem',
              overflowY: 'auto',
              marginBottom: '1rem',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}>
              {communityData.queries?.map((query: any) => (
                <div key={query._id} style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  backgroundColor: query.status === 'open' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                  borderRadius: '0.5rem',
                  borderLeft: `4px solid ${query.status === 'open' ? '#3b82f6' : '#10b981'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: '#4f46e5' }}>{query.userId?.name}</strong>
                      <span className={`badge ${query.status === 'open' ? 'badge-upcoming' : 'badge-completed'}`}>
                        {query.status}
                      </span>
                      <span className="badge badge-active">{query.issueType}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {new Date(query.dateCreated).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ marginBottom: '0.5rem' }}>{query.description}</p>
                  {query.reply && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      padding: '0.75rem', 
                      backgroundColor: 'rgba(16, 185, 129, 0.2)', 
                      borderRadius: '0.5rem'
                    }}>
                      <strong>👨‍💼 Admin Reply:</strong>
                      <p style={{ marginTop: '0.25rem' }}>{query.reply}</p>
                    </div>
                  )}
                </div>
              )) || <p style={{ textAlign: 'center', color: '#6b7280' }}>No queries yet. Ask your first question!</p>}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select 
                  value={newQuery.issueType}
                  onChange={(e) => setNewQuery({ ...newQuery, issueType: e.target.value })}
                  className="input-field" 
                  style={{ width: '200px' }}
                >
                  <option value="general">General</option>
                  <option value="attendance">Attendance Issue</option>
                  <option value="certificate">Certificate Issue</option>
                  <option value="registration">Registration Problem</option>
                  <option value="location">Location/Venue Issue</option>
                  <option value="technical">Technical Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <textarea
                  value={newQuery.description}
                  onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                  placeholder="Describe your issue: attendance not marked, certificate missing, registration error, location confusion, etc..."
                  className="input-field"
                  style={{ flex: 1, minHeight: '60px', resize: 'vertical' }}
                />
                <button onClick={submitQuery} className="btn-primary">Submit</button>
              </div>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div style={{ padding: '1.5rem', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '1rem' }}>💭 Feedback</h2>
            <div style={{ 
              flex: 1, 
              border: '1px solid rgba(255,255,255,0.2)', 
              borderRadius: '0.5rem', 
              padding: '1rem',
              overflowY: 'auto',
              marginBottom: '1rem',
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}>
              {communityData.chatMessages?.filter((msg: any) => msg.messageType === 'feedback').map((msg: any) => (
                <div key={msg._id} style={{ 
                  marginBottom: '1rem', 
                  padding: '0.75rem', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '0.5rem' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#4f46e5' }}>{msg.userId?.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{msg.message}</p>
                </div>
              )) || <p style={{ textAlign: 'center', color: '#6b7280' }}>Share your feedback about events and community.</p>}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select 
                  value={newFeedback.rating}
                  onChange={(e) => setNewFeedback({ ...newFeedback, rating: e.target.value })}
                  className="input-field" 
                  style={{ width: '150px' }}
                >
                  <option value="5">⭐⭐⭐⭐⭐</option>
                  <option value="4">⭐⭐⭐⭐</option>
                  <option value="3">⭐⭐⭐</option>
                  <option value="2">⭐⭐</option>
                  <option value="1">⭐</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <textarea
                  value={newFeedback.content}
                  onChange={(e) => { setNewFeedback({ ...newFeedback, content: e.target.value }); setNewMessage(e.target.value); }}
                  placeholder="Share your feedback about events, organization, or suggestions for improvement..."
                  className="input-field"
                  style={{ flex: 1, minHeight: '60px', resize: 'vertical' }}
                />
                <button onClick={() => postMessage('feedback')} className="btn-primary">Submit</button>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Select a channel</div>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'transparent' }}>
      {/* Communities Sidebar */}
      <div style={{ 
        width: sidebarCollapsed ? '60px' : '240px', 
        backgroundColor: 'rgba(0,0,0,0.2)', 
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
          {!sidebarCollapsed && (
            <div>
              <h3 style={{ marginTop: '0.5rem', color: 'white' }}>Communities</h3>
              <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={() => setViewMode('joined')}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    border: 'none',
                    borderRadius: '0.25rem',
                    backgroundColor: viewMode === 'joined' ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Joined
                </button>
                <button 
                  onClick={() => setViewMode('all')}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    border: 'none',
                    borderRadius: '0.25rem',
                    backgroundColor: viewMode === 'all' ? '#4f46e5' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Discover
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {(viewMode === 'joined' ? communities : allCommunities).map((community) => {
            const isJoined = communities.some(c => c._id === community._id);
            return (
              <div
                key={community._id}
                style={{
                  padding: '0.75rem',
                  margin: '0.25rem 0',
                  borderRadius: '0.5rem',
                  backgroundColor: selectedCommunity?._id === community._id ? 'rgba(79, 70, 229, 0.3)' : 'transparent',
                  border: selectedCommunity?._id === community._id ? '1px solid rgba(79, 70, 229, 0.5)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div 
                    onClick={() => isJoined && setSelectedCommunity(community)}
                    style={{
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: isJoined ? 'pointer' : 'default',
                      opacity: isJoined ? 1 : 0.7
                    }}
                  >
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                  {!sidebarCollapsed && (
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: 'white', fontSize: '0.875rem' }}>
                        {community.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                        {community.collegeName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                        {community.members?.length || 0} members • {community.events?.length || 0} events
                      </div>
                      {viewMode === 'all' && !isJoined && (
                        <button
                          onClick={() => joinCommunity(community._id)}
                          style={{
                            marginTop: '0.25rem',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            border: 'none',
                            borderRadius: '0.25rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channels Sidebar */}
      {selectedCommunity && (
        <div style={{ 
          width: '200px', 
          backgroundColor: 'rgba(0,0,0,0.1)', 
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: 'white', margin: 0 }}>{selectedCommunity.name}</h4>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0 0' }}>
              {selectedCommunity.collegeName}
            </p>
          </div>
          
          <div style={{ flex: 1, padding: '0.5rem' }}>
            {Object.entries(channelCategories).map(([category, channels]) => {
              const categoryName = category === 'text' ? 'Text Channels' : 
                                 category === 'events' ? 'Event Channels' :
                                 category === 'support' ? 'Support Channels' : 'Admin Channels';
              
              return (
                <div key={category} style={{ marginBottom: '1rem' }}>
                  <h5 style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '0.7rem', 
                    textTransform: 'uppercase', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                  }}>
                    {categoryName}
                  </h5>
                  {channels.map((channel) => {
                    // Show admin channels to students but make them view-only
                    // if (channel.adminOnly && role !== 'admin') return null;
                    return (
                      <div
                        key={channel.id}
                        onClick={() => setActiveChannel(channel.id)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          margin: '0.2rem 0',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          backgroundColor: activeChannel === channel.id ? 'rgba(79, 70, 229, 0.3)' : 'transparent',
                          color: activeChannel === channel.id ? 'white' : 'rgba(255,255,255,0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease',
                          opacity: channel.adminOnly && role === 'student' ? 0.7 : 1
                        }}
                        className="channel-item"
                      >
                        <span style={{ fontSize: '0.9rem' }}>#</span>
                        <span>{channel.name}</span>
                        {channel.adminOnly && (
                          <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                            {role === 'student' ? '👁️' : '🔒'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', overflowY: 'auto' }}>
        {selectedCommunity ? renderChannelContent() : (
          <div className="flex-center" style={{ height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <h2>Welcome to EventAura Communities</h2>
              <p>Select a community from the sidebar to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Members Sidebar */}
      {selectedCommunity && (
        <div style={{ 
          width: '200px', 
          backgroundColor: 'rgba(0,0,0,0.1)', 
          backdropFilter: 'blur(10px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          padding: '1rem'
        }}>
          <h4 style={{ color: 'white', marginBottom: '1rem' }}>Members ({communityData?.community.members?.length || 0})</h4>
          <div>
            {communityData?.community.members?.slice(0, 10).map((member: any) => {
              if (!member.userId) return null;
              return (
                <div key={member.userId._id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.5rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {member.userId.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'white' }}>{member.userId.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{member.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityHub;