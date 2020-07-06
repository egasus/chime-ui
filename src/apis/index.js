import { get, put, del, post } from "./apiCore";

export function signup(obj) {
  return post("/api/participants", obj);
}
export function signin(obj) {
  return post("/api/participants", obj);
}
export function updateProfile(id, obj) {
  return put(`/api/participants/${id}`, obj);
}
export function getAllUsers() {
  return get("/api/participants");
}

export function getAllMeetingEvents() {
  return get("/api/events");
}
export function getMeetingEvent(id) {
  return get(`/api/events/${id}`);
}
export function updateMeetingStatus(id, obj) {
  return put(`/api/events/status/${id}`, obj);
}
export function createMeetingEvent(obj) {
  return post("/api/events", obj);
}
export function updateMeetingEvent(id, obj) {
  return put(`/api/events/${id}`, obj);
}
export function delMeetingEvent(id) {
  return del(`/api/events/${id}`);
}
