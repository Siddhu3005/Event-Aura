import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const StudentHome: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [userEvents, setUserEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchUserEvents();
    
    // Listen for event updates
    const handleEventUpdate = () => {
      fetchEvents();
      fetchUserEvents();
    };
    
    window.addEventListener('eventUpdated', handleEventUpdate);
    return () => window.removeEventListener('eventUpdated', handleEventUpdate);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`);
      setEvents(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allUserEvents = [
        ...response.data.events.ongoing,
        ...response.data.events.upcoming,
        ...response.data.events.completed
      ];
      setUserEvents(allUserEvents.map((e: any) => e._id));
    } catch (error) {
      console.error('Error fetching user events:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToRegistration = (eventId: string) => {
    navigate(`/event/${eventId}/register`);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="card-header">
        <h1>Student Dashboard</h1>
        <p>Welcome back! Here are the latest events and opportunities.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h3>Latest Events</h3>
          <button onClick={() => navigate('/communities')} className="btn-secondary">
            View All Events
          </button>
        </div>
        
        {events.length > 0 ? (
          <div className="grid grid-auto">
            {events.map((event: any) => (
              <div key={event._id} className="card">
                <h4>{event.name}</h4>
                <p>Theme: {event.theme}</p>
                <p>Location: {event.location}</p>
                <p>Date: {new Date(event.startDate).toLocaleDateString()}</p>
                <p>Participants: {event.participants?.length || 0}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  {userEvents.includes(event._id) ? (
                    <span className="badge badge-completed">✓ Registered</span>
                  ) : new Date() < new Date(event.registrationDeadline) ? (
                    <button 
                      onClick={() => goToRegistration(event._id)}
                      className="btn-primary"
                      style={{ fontSize: '0.875rem' }}
                    >
                      Register
                    </button>
                  ) : (
                    <span className="badge badge-upcoming">Registration Closed</span>
                  )}
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
        ) : (
          <p>No events available at the moment.</p>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div className="card" onClick={() => navigate('/communities')} style={{ cursor: 'pointer' }}>
          <h4>🏛️ Communities</h4>
          <p>Join college communities and connect with peers</p>
        </div>
        
        <div className="card" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <h4>👤 Profile</h4>
          <p>View your events, certificates, and achievements</p>
        </div>
        
        <div className="card" onClick={() => navigate('/leaderboard')} style={{ cursor: 'pointer' }}>
          <h4>🏆 Leaderboard</h4>
          <p>See top performers and your ranking</p>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;