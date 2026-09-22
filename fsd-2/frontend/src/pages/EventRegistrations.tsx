import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EventRegistrations: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
    fetchEvent();
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/registrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '2rem' }}>
        ← Back
      </button>

      <div className="card-header">
        <h1>Event Registrations</h1>
        {event && (
          <div>
            <h2>{event.name}</h2>
            <p>Total Registrations: {registrations.length}</p>
          </div>
        )}
      </div>

      <div className="card">
        {registrations.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>College</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Year</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Team</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Resume</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Registered</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration: any) => (
                  <tr key={registration._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '1rem' }}>{registration.userId?.name}</td>
                    <td style={{ padding: '1rem' }}>{registration.userId?.email}</td>
                    <td style={{ padding: '1rem' }}>{registration.collegeName}</td>
                    <td style={{ padding: '1rem' }}>{registration.yearOfStudy}</td>
                    <td style={{ padding: '1rem' }}>{registration.phone}</td>
                    <td style={{ padding: '1rem' }}>{registration.teamName || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      {registration.resumeUrl ? (
                        <a href={registration.resumeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                          View Resume
                        </a>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(registration.registeredAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No registrations yet.</p>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations;