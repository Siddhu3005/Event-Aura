import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getToken } from '../utils/auth';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const ManageMembers: React.FC = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchCommunityData();
  }, [communityId]);

  const fetchCommunityData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/communities/${communityId}`);
      setCommunity(response.data.community);
    } catch (error) {
      console.error('Error fetching community:', error);
    }
  };

  const updateMemberRole = async (userId: string, role: string) => {
    try {
      const token = getToken();
      await axios.put(`${API_BASE_URL}/permissions/communities/${communityId}/members/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCommunityData();
      alert('Member role updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update member role');
    }
  };

  const grantEventPermissions = async (userId: string, eventId: string) => {
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/permissions/events/${eventId}/grant`,
        { userId, permissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Permissions granted successfully!');
      setPermissions([]);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to grant permissions');
    }
  };

  if (!community) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Manage Members - {community.name}</h1>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Community Members ({community.members?.length || 0})</h3>
        <div style={{ marginTop: '1rem' }}>
          {community.members?.map((member: any) => {
            if (!member.userId) return null;
            return (
              <div key={member.userId._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div>
                  <strong>{member.userId.name}</strong>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {member.userId.email}
                  </div>
                  <span className={`badge ${member.role === 'member' ? 'badge-active' : 'badge-upcoming'}`}>
                    {member.role}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.userId._id, e.target.value)}
                    className="input-field"
                    style={{ width: '120px' }}
                  >
                    <option value="member">Member</option>
                    <option value="moderator">Moderator</option>
                  </select>
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="btn-secondary"
                  >
                    Permissions
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMember && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Grant Event Permissions - {selectedMember?.userId?.name}</h3>
          <div style={{ marginTop: '1rem' }}>
            <h4>Available Events:</h4>
            {community.events?.map((event: any) => (
              <div key={event._id} style={{
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{event.name}</strong>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {event.theme} • {new Date(event.startDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input
                        type="checkbox"
                        checked={permissions.includes('manage_attendance')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPermissions([...permissions, 'manage_attendance']);
                          } else {
                            setPermissions(permissions.filter(p => p !== 'manage_attendance'));
                          }
                        }}
                      />
                      Manage Attendance
                    </label>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input
                        type="checkbox"
                        checked={permissions.includes('manage_certificates')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPermissions([...permissions, 'manage_certificates']);
                          } else {
                            setPermissions(permissions.filter(p => p !== 'manage_certificates'));
                          }
                        }}
                      />
                      Manage Certificates
                    </label>
                  </div>
                  <button
                    onClick={() => grantEventPermissions(selectedMember?.userId?._id, event._id)}
                    className="btn-primary"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Grant Permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelectedMember(null)}
            className="btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageMembers;
