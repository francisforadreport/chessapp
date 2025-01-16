import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5001", // Backend URL
});

export const fetchUsers = () => API.get("/users");
export const fetchGames = () => API.get("/games");
