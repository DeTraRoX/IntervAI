import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useInterviewStore = create((set, get) => ({
  history: [],
  activeInterview: null,
  currentQuestionIndex: 0,
  loading: false,
  error: null,
  activeReport: null,

  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/interview/history`);
      set({ history: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch history', loading: false });
    }
  },

  createInterview: async (role, type, difficulty) => {
    set({ loading: true, error: null, activeInterview: null, currentQuestionIndex: 0 });
    try {
      const res = await axios.post(`${API_URL}/interview/create`, { role, type, difficulty });
      set({ activeInterview: res.data, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to start interview', loading: false });
      return null;
    }
  },

  submitAnswer: async (questionId, textAnswer, codeAnswer) => {
    const active = get().activeInterview;
    if (!active) return false;

    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/interview/submit-answer`, {
        interviewId: active._id,
        questionId,
        textAnswer,
        codeAnswer
      });
      
      // Update local state with latest answers
      set({ activeInterview: res.data.interview, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to submit answer', loading: false });
      return false;
    }
  },

  nextQuestion: () => {
    const index = get().currentQuestionIndex;
    const active = get().activeInterview;
    if (active && index < active.questions.length - 1) {
      set({ currentQuestionIndex: index + 1 });
      return true;
    }
    return false;
  },

  completeInterview: async () => {
    const active = get().activeInterview;
    if (!active) return null;

    set({ loading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/interview/complete`, {
        interviewId: active._id
      });
      set({ activeReport: res.data, activeInterview: null, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to finalize report summary', loading: false });
      return null;
    }
  },

  fetchInterviewDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/interview/${id}`);
      set({ activeReport: res.data, loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load report details', loading: false });
      return null;
    }
  }
}));
