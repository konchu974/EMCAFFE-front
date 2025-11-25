export const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://api-emcafe-3.onrender.com/api';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};
