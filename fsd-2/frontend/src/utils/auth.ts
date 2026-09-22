export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    return token && token.length > 10 ? token : null;
  } catch {
    return null;
  }
};

export const getRole = (): string | null => {
  try {
    const role = localStorage.getItem('role');
    return role === 'admin' || role === 'student' ? role : null;
  } catch {
    return null;
  }
};

export const setAuth = (token: string, role: string): void => {
  try {
    if (token && token.length > 10 && (role === 'admin' || role === 'student')) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
    }
  } catch (error) {
    console.error('Auth storage error:', error);
  }
};

export const clearAuth = (): void => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  } catch (error) {
    console.error('Auth clear error:', error);
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  const role = getRole();
  return !!(token && role);
};