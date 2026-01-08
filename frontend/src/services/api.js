// src/services/api.js
import axios from "axios";

//const API_URL = "http://127.0.0.1:5000"; // Your backend URL
const API_URL = "https://trackit-orbo.onrender.com";

export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
  } catch (err) {
    console.error(err.response?.data || err);
    throw err;
  }
};

export const loginUser = async (credentials) => {
  try {
    const res = await axios.post(`${API_URL}/login`, credentials);
    return res.data; // Should include JWT
  } catch (err) {
    console.error(err.response?.data || err);
    throw err;
  }
};

export const getMedia = async (token) => {
  const res = await axios.get(`${API_URL}/media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addMedia = async (mediaData, token) => {
  const res = await axios.post(`${API_URL}/media`, mediaData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const editMedia = async (id, mediaData, token) => {
  const res = await axios.put(`${API_URL}/media/${id}`, mediaData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteMedia = async (id, token) => {
  const res = await axios.delete(`${API_URL}/media/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const logoutUser = async () => {
  try {
    await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
  } catch (err) {
    console.error("Logout failed:", err.response?.data || err);
  }
};

