import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken, getRole } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CommunityPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState('events');
  const [communityData, setCommunityData] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newQuery, setNewQuery] = useState({ issueType: 'general', description: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', pinned: false });
  const role = getRole();

  useEffect(() => {
    if (id) {
      fetchCommunityData();
    }
  }, [id]);

  const fetchCommunityData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/communities/${id}`);
      setCommunityData(response.data);
    } catch (error) {
      console.error('Error fetching community data:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/communities/${id}/chat`, 
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchCommunityData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send message');
    }
  };

  const submitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/queries`, 
        { 
          communityId: id,
          issueType: newQuery.issueType,
          description: newQuery.description
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewQuery({ issueType: 'general', description: '' });
      fetchCommunityData();
      alert('Query submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit query');
    }
  };

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/communities/${id}/announcements`, 
        newAnnouncement,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAnnouncement({ title: '', content: '', pinned: false });
      fetchCommunityData();
      alert('Announcement added successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add announcement');
    }
  };

  const channels = ['events', 'chat', 'queries', 'announcements'];

  const renderChannelContent = () => {
    if (!communityData) return <div className="loading">Loading...</div>;

    switch (activeChannel) {
      case 'events':
        return (
          <div>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3>Community Events</h3>
              {role === 'admin' && (
                <button 
                  onClick={() => navigate(`/community/${id}/create-event`)}
                  className="btn-primary"
                >
                  Create Event
                </button>
              )}
            </div>
            <div className="grid grid-auto">
              {communityData.community.events?.map((event: any) => (
                <div key={event._id} className="card">
                  <h4>{event.name}</h4>
                  <p>Theme: {event.theme}</p>
                  <p>Location: {event.location}</p>
                  <p>Date: {new Date(event.startDate).toLocaleDateString()}</p>
                  <p>Participants: {event.participants?.length || 0}</p>
                  <div style={{ marginTop: '1rem' }}>
                    <button className="btn-secondary">Register</button>
                  </div>
                </div>
              )) || <p>No events yet.</p>}
            </div>
          </div>
        );

      case 'chat':
        return (
          <div>
            <h3>Community Chat</h3>
            <div className="card" style={{ marginTop: '1rem' }}>
              <div style={{ 
                height: '400px', 
                overflowY: 'auto', 
                border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '0.5rem', 
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                {communityData.chatMessages?.map((msg: any) => (
                  <div key={msg._id} style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong>{msg.userId?.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{msg.message}</p>
                  </div>
                )) || <p>No messages yet.</p>}
              </div>
              
              <form onSubmit={sendMessage}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-field"
                    style={{ flex: 1 }}
                    required
                  />
                  <button type="submit" className="btn-primary">Send</button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'queries':
        return (
          <div>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3>Community Queries</h3>
            </div>
            
            {/* Submit New Query */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h4>Submit a Query</h4>
              <form onSubmit={submitQuery}>
                <div style={{ marginBottom: '1rem' }}>
                  <select
                    value={newQuery.issueType}
                    onChange={(e) => setNewQuery({ ...newQuery, issueType: e.target.value })}
                    className="input-field"
                  >
                    <option value="general">General</option>
                    <option value="certificate">Certificate</option>
                    <option value="registration">Registration</option>
                    <option value="attendance">Attendance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <textarea
                    value={newQuery.description}
                    onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                    placeholder="Describe your query..."
                    className="input-field"
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Submit Query</button>
              </form>
            </div>

            {/* Existing Queries */}
            <div className="grid grid-auto">
              {communityData.queries?.map((query: any) => (
                <div key={query._id} className="card">
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <span className={`badge ${query.status === 'open' ? 'badge-upcoming' : 'badge-completed'}`}>
                      {query.status}
                    </span>
                    <span className="badge badge-active">{query.issueType}</span>
                  </div>
                  <h4>Query by {query.userId?.name}</h4>
                  <p>{query.description}</p>
                  {query.reply && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                      <strong>Admin Reply:</strong>
                      <p>{query.reply}</p>
                    </div>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    {new Date(query.dateCreated).toLocaleDateString()}
                  </p>
                </div>
              )) || <p>No queries yet.</p>}
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3>Announcements</h3>
              {role === 'admin' && (
                <button 
                  className="btn-primary"
                  onClick={() => setActiveChannel('add-announcement')}
                >
                  Add Announcement
                </button>
              )}
            </div>
            
            <div className="grid grid-auto">
              {communityData.community.announcements?.map((announcement: any) => (
                <div key={announcement._id} className="card">
                  {announcement.pinned && (
                    <span className="badge badge-active" style={{ marginBottom: '0.5rem' }}>📌 Pinned</span>
                  )}
                  <h4>{announcement.title}</h4>
                  <p>{announcement.content}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '1rem' }}>
                    By {announcement.createdBy?.name} • {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )) || <p>No announcements yet.</p>}
            </div>
          </div>
        );

      case 'add-announcement':
        return (
          <div>
            <h3>Add New Announcement</h3>
            <div className="card" style={{ marginTop: '1rem', maxWidth: '600px' }}>
              <form onSubmit={addAnnouncement}>
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                    placeholder="Announcement title..."
                    className="input-field"
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                    placeholder="Announcement content..."
                    className="input-field"
                    rows={4}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={newAnnouncement.pinned}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
                    />
                    Pin this announcement
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn-primary">Add Announcement</button>
                  <button 
                    type="button" 
                    onClick={() => setActiveChannel('announcements')}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      default:
        return <div>Select a channel</div>;
    }
  };

  if (!communityData) return <div className="loading">Loading community...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Community Header */}
      <div className="card-header">
        <h1>{communityData.community.name}</h1>
        <p>{communityData.community.description}</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <span className="badge badge-active">
            {communityData.community.members?.length || 0} Members
          </span>
          <span className="badge badge-upcoming">
            {communityData.community.events?.length || 0} Events
          </span>
          <span className="badge badge-completed">
            Category: {communityData.community.category}
          </span>
        </div>
      </div>

      {/* Channel Navigation */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {channels.map(channel => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`tab-button ${activeChannel === channel ? 'active' : ''}`}
            >
              {channel}
            </button>
          ))}
        </div>
      </div>

      {/* Channel Content */}
      <div>
        {renderChannelContent()}
      </div>
    </div>
  );
};

export default CommunityPage;