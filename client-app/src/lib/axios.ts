import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Basic axios instance for client or server usage (without automatic cookies)
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
