import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AttendanceTracker: React.FC = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event:', error);
      setLoading(false);
    }
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const markAttendance = async () => {
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/events/${eventId}/attendance`, 
        { participantIds: selectedParticipants },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Attendance marked for ${selectedParticipants.length} participants. Certificates generated!`);
      setSelectedParticipants([]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark attendance');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card-header">
        <h1>📋 Attendance Tracker</h1>
        <p>{event.name} - {new Date(event.startDate).toLocaleDateString()}</p>
      </div>

      <div className="card">
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <h3>Registered Participants ({event.participants?.length || 0})</h3>
          <div>
            <span style={{ marginRight: '1rem' }}>
              Selected: {selectedParticipants.length}
            </span>
            <button 
              onClick={markAttendance}
              disabled={selectedParticipants.length === 0}
              className="btn-primary"
            >
              Mark Attendance & Generate Certificates
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {event.participants?.map((participant: any) => (
            <div 
              key={participant._id}
              onClick={() => toggleParticipant(participant._id)}
              style={{
                padding: '1rem',
                border: `2px solid ${selectedParticipants.includes(participant._id) ? 'var(--success)' : 'var(--border-color)'}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: selectedParticipants.includes(participant._id) ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: selectedParticipants.includes(participant._id) ? 'var(--success)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px'
                }}>
                  {selectedParticipants.includes(participant._id) && '✓'}
                </div>
                
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {participant.name?.charAt(0).toUpperCase()}
                </div>
                
                <div>
                  <h4>{participant.name}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {participant.email}
                  </p>
                </div>
              </div>
            </div>
          )) || <p>No participants registered</p>}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;