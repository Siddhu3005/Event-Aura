import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken, getRole } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EventDetails: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registrationLink, setRegistrationLink] = useState('');
  const role = getRole();

  useEffect(() => {
    fetchEventDetails();
    if (role === 'admin') {
      getRegistrationLink();
    }
    
    // Listen for event updates
    const handleEventUpdate = (e: any) => {
      if (e.detail.eventId === eventId) {
        fetchEventDetails();
      }
    };
    
    window.addEventListener('eventUpdated', handleEventUpdate);
    return () => window.removeEventListener('eventUpdated', handleEventUpdate);
  }, [eventId, role]);

  const fetchEventDetails = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(response.data);
      
      // Check if user is registered using EventRegistration
      try {
        await axios.get(`${API_BASE_URL}/events/${eventId}/registrations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userId = JSON.parse(atob(token!.split('.')[1])).userId;
        setIsRegistered(response.data.participants?.includes(userId));
      } catch {
        // If can't access registrations (student), check participants
        const userId = JSON.parse(atob(token!.split('.')[1])).userId;
        setIsRegistered(response.data.participants?.includes(userId));
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event:', error);
      setLoading(false);
    }
  };

  const goToRegistration = () => {
    navigate(`/event/${eventId}/register`);
  };

  const viewRegistrations = () => {
    navigate(`/event/${eventId}/registrations`);
  };

  const unregisterFromEvent = async () => {
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/events/${eventId}/unregister`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsRegistered(false);
      fetchEventDetails();
      alert('Successfully unregistered from event!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Unregistration failed');
    }
  };

  const getRegistrationLink = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/registration-link`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrationLink(response.data.registrationLink);
    } catch (error) {
      console.error('Error getting registration link:', error);
    }
  };

  const copyRegistrationLink = () => {
    navigator.clipboard.writeText(registrationLink);
    alert('Registration link copied to clipboard!');
  };



  if (loading) return <div className="loading">Loading event details...</div>;
  if (!event) return <div>Event not found</div>;

  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const deadline = new Date(event.registrationDeadline);
  
  const eventStatus = now > endDate ? 'completed' : now >= startDate ? 'ongoing' : 'upcoming';
  const canRegister = now < deadline && eventStatus === 'upcoming';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '2rem' }}>
        ← Back
      </button>

      <div className="card-header">
        <div className="flex-between">
          <div>
            <h1>{event.name}</h1>
            <p>{event.description}</p>
          </div>
          <span className={`badge ${eventStatus === 'completed' ? 'badge-completed' : eventStatus === 'ongoing' ? 'badge-active' : 'badge-upcoming'}`}>
            {eventStatus.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>Event Details</h3>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Theme:</strong> {event.theme}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Start:</strong> {startDate.toLocaleString()}</p>
              <p><strong>End:</strong> {endDate.toLocaleString()}</p>
              <p><strong>Registration Deadline:</strong> {deadline.toLocaleString()}</p>
              <p><strong>Attendance Tracking:</strong> {event.attendanceProvided ? 'Yes' : 'No'}</p>
              <p><strong>Certificates:</strong> {event.certificatesProvided ? 'Available' : 'Not Available'}</p>
            </div>
          </div>

          {event.prizes?.length > 0 && (
            <div className="card" style={{ marginBottom: '2rem' }}>
              <h3>Prizes</h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {event.prizes.map((prize: any, index: number) => (
                  <div key={index} className="card" style={{ textAlign: 'center', minWidth: '150px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'}
                    </div>
                    <h4>{prize.position === 1 ? '1st' : prize.position === 2 ? '2nd' : '3rd'} Prize</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      ₹{prize.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3>Event Guidelines</h3>
            <div style={{ marginTop: '1rem' }}>
              <p>{event.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3>Registration</h3>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Participants:</strong> {event.participants?.length || 0}</p>
              
              {role === 'student' && (
                <div style={{ marginTop: '1rem' }}>
                  {isRegistered ? (
                    <div>
                      <span className="badge badge-active" style={{ marginBottom: '1rem', display: 'block' }}>
                        ✅ Registered
                      </span>
                      {canRegister && (
                        <button onClick={unregisterFromEvent} className="btn-danger" style={{ width: '100%' }}>
                          Unregister
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      {canRegister ? (
                        <button onClick={goToRegistration} className="btn-primary" style={{ width: '100%' }}>
                          Register Now
                        </button>
                      ) : (
                        <div>
                          <span className="badge badge-completed">Registration Closed</span>
                          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                            {now > deadline ? 'Deadline passed' : 'Event has started'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {role === 'admin' && (
                <div style={{ marginTop: '1rem' }}>
                  {now < startDate && (
                    <button 
                      onClick={() => navigate(`/event/${eventId}/edit`)}
                      className="btn-secondary"
                      style={{ width: '100%', marginBottom: '0.5rem' }}
                    >
                      Edit Event
                    </button>
                  )}
                  <button 
                    onClick={copyRegistrationLink}
                    className="btn-primary"
                    style={{ width: '100%', marginBottom: '0.5rem' }}
                  >
                    Copy Registration Link
                  </button>
                  <button 
                    onClick={viewRegistrations}
                    className="btn-secondary"
                    style={{ width: '100%' }}
                  >
                    View Registrations ({event.participants?.length || 0})
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3>Community</h3>
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Name:</strong> {event.communityId?.name}</p>
              <p><strong>College:</strong> {event.communityId?.collegeName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;