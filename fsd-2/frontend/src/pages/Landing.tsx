import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config';
import { getToken } from '../utils/auth';

const Landing: React.FC = () => {
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
    fetchEvents();
    
    // Listen for event updates
    const handleEventUpdate = () => {
      fetchEvents();
      fetchCommunities();
    };
    
    window.addEventListener('eventUpdated', handleEventUpdate);
    return () => window.removeEventListener('eventUpdated', handleEventUpdate);
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COMMUNITIES.GET_ALL}`);
      setCommunities(response.data);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.GET_ALL}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.GET_ALL}?search=${searchTerm}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error searching events:', error);
    }
  };

  const joinCommunity = async (communityId: string) => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.COMMUNITIES.JOIN(communityId)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Joined community successfully!');
      fetchCommunities();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join community');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>EventAura</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#6b7280' }}>
          Connect with college communities and discover amazing events
        </p>
        
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search events by theme (science, quiz, bootcamp...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ flex: 1 }}
          />
          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
        </div>
      </div>

      {/* Featured Communities */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Featured Communities</h2>
        <div className="grid grid-auto">
          {communities.map((community: any) => (
            <div key={community._id} className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>{community.name}</h3>
              <p style={{ marginBottom: '0.5rem' }}>College: {community.collegeName}</p>
              <p style={{ marginBottom: '0.5rem' }}>Members: {community.members?.length || 0}</p>
              <p style={{ marginBottom: '1rem' }}>Events: {community.events?.length || 0}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => joinCommunity(community._id)}
                  className="btn-secondary"
                >
                  Join Community
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div>
        <h2 style={{ marginBottom: '1.5rem' }}>Recent Events</h2>
        <div className="grid grid-auto">
          {events.slice(0, 6).map((event: any) => (
            <div key={event._id} className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>{event.name}</h3>
              <p style={{ marginBottom: '0.5rem' }}>Theme: {event.theme}</p>
              <p style={{ marginBottom: '0.5rem' }}>Location: {event.location}</p>
              <p style={{ marginBottom: '0.5rem' }}>Date: {new Date(event.startDate).toLocaleDateString()}</p>
              <p style={{ marginBottom: '1rem' }}>Community: {event.communityId?.name}</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`badge ${event.certificatesProvided ? 'badge-active' : 'badge-completed'}`}>
                  {event.certificatesProvided ? 'Certificate Available' : 'No Certificate'}
                </span>
                <button 
                  onClick={() => navigate(`/event/${event._id}`)}
                  className="btn-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;