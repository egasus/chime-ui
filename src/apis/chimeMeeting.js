import * as queryString from "query-string";
import axios from "axios";
import { get } from "./apiCore";
const isDev = process.env.NODE_ENV !== "production";

// const baseUrl = "https://k2rjhzwum7.execute-api.us-east-1.amazonaws.com/Prod";

let baseUrl;
if (isDev) {
  baseUrl = "http://localhost:8080";
} else {
  baseUrl = "https://selfiepop-api.herokuapp.com";
}

// const baseUrl = "https://selfiepop-api.herokuapp.com";

async function request(path, config) {
  return axios({
    url: `${baseUrl}${path}`,
    ...config,
  });
}

export async function post(path, queryParams = {}) {
  const qry = queryString.stringify(queryParams, { arrayFormat: "bracket" });
  const response = await request(`${path}${qry ? "?" : ""}${qry}`, {
    method: "post",
  });

  return response && response.data;
}

export function createMeeting(title, name, region) {
  let params = `?title=${title}&name=${name}`;
  if (region) {
    params = `${params}&region=${region}`;
  }

  return post(`/api/meeting/join${params}`);
}

export function endMeeting(title) {
  return post(`/api/meeting/end?title=${title}`);
}

export function getAttendee(title, attendeeId) {
  return get(`/api/meeting/attendee?title=${title}&attendee=${attendeeId}`);
}
