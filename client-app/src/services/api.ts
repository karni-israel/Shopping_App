import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // כתובת השרת שלך
  withCredentials: true, // חובה! שולח את ה-Cookies בכל בקשה
});

export default api;