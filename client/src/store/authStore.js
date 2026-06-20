import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Set auth header token helper
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Check local storage for existing session
const localToken = localStorage.getItem('intervai_token');
if (localToken) {
  setAuthToken(localToken);
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localToken,
  isAuthenticated: !!localToken,
  loading: false,
  error: null,

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const { token } = res.data;
      
      localStorage.setItem('intervai_token', token);
      setAuthToken(token);

      set({
        token,
        isAuthenticated: true,
        user: { _id: res.data._id, name: res.data.name, email: res.data.email },
        loading: false
      });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token } = res.data;

      localStorage.setItem('intervai_token', token);
      setAuthToken(token);

      set({
        token,
        isAuthenticated: true,
        user: { _id: res.data._id, name: res.data.name, email: res.data.email },
        loading: false
      });
      return true;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('intervai_token');
    setAuthToken(null);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null
    });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return;

    set({ loading: true });
    setAuthToken(token);
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      set({ user: res.data, isAuthenticated: true, loading: false });
    } catch (err) {
      console.error('Failed to load session user profile:', err.message);
      get().logout();
      set({ loading: false });
    }
  }
}));
