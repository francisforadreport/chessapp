import axios from "axios";

export const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

export const fetchUsers = () => API.get("/users");
export const fetchGames = () => API.get("/games");