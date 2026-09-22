import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EventRegister: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    collegeName: '',
    yearOfStudy: '',
    phone: '',
    resumeUrl: '',
    teamName: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await axios.post(`${API_BASE_URL}/events/${eventId}/register`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(response.data.message);
      navigate(`/event/${eventId}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '2rem' }}>
          ← Back
        </button>

        <div className="card">
          <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Register for Event</h2>
          <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: '0.5rem' }}>
            <h3>{event.name}</h3>
            <p>Theme: {event.theme}</p>
            <p>Date: {new Date(event.startDate).toLocaleDateString()}</p>
            <p>Location: {event.location}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>College Name *</label>
              <input
                type="text"
                name="collegeName"
                placeholder="Enter your college name"
                className="input-field"
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Year of Study *</label>
              <select
                name="yearOfStudy"
                className="input-field"
                onChange={handleChange}
                required
              >
                <option value="">Select Year of Study</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                className="input-field"
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Resume Link (Optional)</label>
              <input
                type="url"
                name="resumeUrl"
                placeholder="https://drive.google.com/your-resume"
                className="input-field"
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label>Team Name (Optional)</label>
              <input
                type="text"
                name="teamName"
                placeholder="Enter team name if applicable"
                className="input-field"
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }}>
              Complete Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventRegister;