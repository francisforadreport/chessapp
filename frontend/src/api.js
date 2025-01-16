import axios from "axios";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});

export const fetchUsers = () => API.get("/users");
export const fetchGames = () => API.get("/games");