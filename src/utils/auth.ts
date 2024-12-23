// Authentication utility functions

export const checkAuth = async (token: string | null) => {
  if (!token) return false;

  try {
    const response = await fetch('http://localhost:8000/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (err) {
    console.error('Auth check failed:', err);
    return false;
  }
};

export const handleLogout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin';
};

