import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/leaderboard`);
      setLeaderboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return 'linear-gradient(135deg, #FFD700, #FFA500)';
      case 2: return 'linear-gradient(135deg, #C0C0C0, #A9A9A9)';
      case 3: return 'linear-gradient(135deg, #CD7F32, #B8860B)';
      default: return 'var(--bg-secondary)';
    }
  };

  if (loading) return <div className="loading">Loading leaderboard...</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="card-header">
        <h1>🏆 Leaderboard</h1>
        <p>Top performing students across all communities</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
          >
            All Students
          </button>
          <button 
            onClick={() => setFilter('events')}
            className={filter === 'events' ? 'btn-primary' : 'btn-secondary'}
          >
            By Events
          </button>
          <button 
            onClick={() => setFilter('certificates')}
            className={filter === 'certificates' ? 'btn-primary' : 'btn-secondary'}
          >
            By Certificates
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: '2rem', marginBottom: '3rem' }}>
          {/* 2nd Place */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '100px', 
              height: '80px', 
              background: getRankColor(2),
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: 'white',
              fontSize: '2rem'
            }}>
              🥈
            </div>
            <h3>{leaderboard[1]?.name}</h3>
            <p>{leaderboard[1]?.totalScore} points</p>
          </div>

          {/* 1st Place */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '120px', 
              height: '100px', 
              background: getRankColor(1),
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: 'white',
              fontSize: '2.5rem',
              border: '3px solid #FFD700'
            }}>
              🥇
            </div>
            <h2>{leaderboard[0]?.name}</h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{leaderboard[0]?.totalScore} points</p>
          </div>

          {/* 3rd Place */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '100px', 
              height: '60px', 
              background: getRankColor(3),
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              color: 'white',
              fontSize: '2rem'
            }}>
              🥉
            </div>
            <h3>{leaderboard[2]?.name}</h3>
            <p>{leaderboard[2]?.totalScore} points</p>
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="card">
        <h3>Complete Rankings</h3>
        <div style={{ marginTop: '1rem' }}>
          {leaderboard.map((user: any, index: number) => (
            <div key={user._id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              marginBottom: '0.5rem',
              background: index < 3 ? getRankColor(index + 1) : 'var(--hover-bg)',
              borderRadius: '0.5rem',
              border: index < 3 ? '2px solid rgba(255,255,255,0.3)' : '1px solid var(--border-color)'
            }}>
              <div style={{ 
                minWidth: '60px', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: index < 3 ? 'white' : 'var(--text-primary)'
              }}>
                {getRankIcon(index + 1)}
              </div>
              
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                marginRight: '1rem'
              }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ color: index < 3 ? 'white' : 'var(--text-primary)' }}>{user.name}</h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  <span style={{ color: index < 3 ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                    📅 {user.eventCount} Events
                  </span>
                  <span style={{ color: index < 3 ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                    📜 {user.eventCount} Certificates
                  </span>
                  <span style={{ color: index < 3 ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}>
                    🏆 {user.badgeCount} Badges
                  </span>
                </div>
              </div>

              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: index < 3 ? 'white' : 'var(--accent-primary)'
              }}>
                {user.totalScore}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;