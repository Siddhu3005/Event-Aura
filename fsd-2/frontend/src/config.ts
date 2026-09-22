export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login'
  },
  COMMUNITIES: {
    GET_ALL: '/communities',
    JOIN: (id: string) => `/communities/${id}/join`,
    GET_BY_ID: (id: string) => `/communities/${id}`
  },
  EVENTS: {
    GET_ALL: '/events',
    CREATE: '/events',
    REGISTER: (id: string) => `/events/${id}/register`,
    DELETE: (id: string) => `/events/${id}`
  },
  QUERIES: {
    CREATE: '/queries',
    GET_BY_COMMUNITY: (id: string) => `/queries/community/${id}`,
    RESPOND: (id: string) => `/queries/${id}/respond`
  },
  USERS: {
    PROFILE: '/users/profile',
    ACTIVITY: '/users/activity',
    LEADERBOARD: '/users/leaderboard',
    ADMIN_STATS: '/users/admin/stats'
  }
};