import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:8080/api" });

export const getMeetings = () => API.get("/meetings");
export const createMeeting = (data) => API.post("/meetings", data);
export const updateMeeting = (id, data) => API.put(`/meetings/${id}`, data);
export const deleteMeeting = (id) => API.delete(`/meetings/${id}`);
export const analyzeMeeting = (id) => API.post(`/meetings/${id}/analyze`);
