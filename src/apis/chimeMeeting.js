import * as queryString from "query-string";
import axios from "axios";
const isDev = process.env.NODE_ENV !== "production";

// const baseUrl = "https://7jswahvsga.execute-api.us-east-1.amazonaws.com/Prod";
// const baseUrl = "https://7jswahvsga.execute-api.us-east-1.amazonaws.com/Prod";
// const baseUrl = "https://abfa1pspvg.execute-api.us-east-1.amazonaws.com/Prod";
// const baseUrl = "https://ghmwhv8jyf.execute-api.us-east-1.amazonaws.com/Prod";
// const baseUrl = "https://ac6y1jiqre.execute-api.us-east-1.amazonaws.com/Prod";

let baseUrl;
if (isDev) {
  baseUrl = "http://localhost:8080";
} else {
  baseUrl = "https://selfiepop-api.herokuapp.com";
}

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
