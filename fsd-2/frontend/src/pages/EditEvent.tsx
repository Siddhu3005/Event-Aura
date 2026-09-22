import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EditEvent: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    location: '',
    theme: '',
    description: '',
    prizes: [{ position: 1, amount: 0 }]
  });
  const [registrationLink, setRegistrationLink] = useState('');

  useEffect(() => {
    fetchEvent();
    getRegistrationLink();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
      const eventData = response.data;
      setEvent(eventData);
      
      setFormData({
        name: eventData.name,
        startDate: new Date(eventData.startDate).toISOString().slice(0, 16),
        endDate: new Date(eventData.endDate).toISOString().slice(0, 16),
        registrationDeadline: new Date(eventData.registrationDeadline).toISOString().slice(0, 16),
        location: eventData.location,
        theme: eventData.theme,
        description: eventData.description,
        prizes: eventData.prizes.length > 0 ? eventData.prizes : [{ position: 1, amount: 0 }]
      });
    } catch (error) {
      console.error('Error fetching event:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.put(`${API_BASE_URL}/events/${eventId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Trigger global event update
      window.dispatchEvent(new CustomEvent('eventUpdated', { detail: { eventId } }));
      
      alert('Event updated successfully!');
      navigate(`/event/${eventId}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update event');
    }
  };

  const copyRegistrationLink = () => {
    navigator.clipboard.writeText(registrationLink);
    alert('Registration link copied to clipboard!');
  };

  if (!event) return <div className="loading">Loading...</div>;

  const canEdit = new Date() < new Date(event.startDate);

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Edit Event: {event.name}</h1>
      
      {!canEdit && (
        <div className="card" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', marginBottom: '2rem' }}>
          <p><strong>Note:</strong> This event has already started and cannot be edited.</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Registration Link</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={registrationLink}
            readOnly
            className="input-field"
            style={{ flex: 1 }}
          />
          <button onClick={copyRegistrationLink} className="btn-secondary">
            Copy Link
          </button>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Share this link with students for event registration
        </p>
      </div>

      {canEdit && (
        <form onSubmit={handleSubmit} className="card">
          <h3>Edit Event Details</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label>Event Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label>End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Registration Deadline</label>
            <input
              type="datetime-local"
              value={formData.registrationDeadline}
              onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label>Theme</label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select Theme</option>
                <option value="technology">Technology</option>
                <option value="science">Science</option>
                <option value="arts">Arts</option>
                <option value="sports">Sports</option>
                <option value="business">Business</option>
                <option value="cultural">Cultural</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={4}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Prizes (Optional)</label>
            {formData.prizes.map((prize, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <select
                  value={prize.position}
                  onChange={(e) => {
                    const newPrizes = [...formData.prizes];
                    newPrizes[index].position = parseInt(e.target.value);
                    setFormData({ ...formData, prizes: newPrizes });
                  }}
                  className="input-field"
                  style={{ width: '120px' }}
                >
                  <option value={1}>1st Place</option>
                  <option value={2}>2nd Place</option>
                  <option value={3}>3rd Place</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  value={prize.amount}
                  onChange={(e) => {
                    const newPrizes = [...formData.prizes];
                    newPrizes[index].amount = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, prizes: newPrizes });
                  }}
                  className="input-field"
                  style={{ flex: 1 }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary">
              Update Event
            </button>
            <button 
              type="button" 
              onClick={() => navigate(`/event/${eventId}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditEvent;