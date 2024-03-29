import * as queryString from "query-string";
import axios from "axios";
import { API_URL } from "config/constants";

// const parameters = queryString.parse(window.location.search);
// export const baseUrl =
//   parameters.api_url ||
//   process.env.REACT_APP_API_URL ||
//   "https://selfiepop-api.herokuapp.com"
const isDev = process.env.NODE_ENV !== "production";
let baseUrl;
if (isDev) {
  baseUrl = "http://localhost:8080";
} else {
  // baseUrl = "https://selfiepop-api.herokuapp.com";
  baseUrl = API_URL;
}

function attachAuthorizationHeader(requestConfig) {
  const token = localStorage.getItem("token");

  return token
    ? Object.assign({}, requestConfig, {
        headers: Object.assign({}, requestConfig.headers || {}, {
          Authentication: `Bearer ${token}`,
        }),
      })
    : requestConfig;
}

function errorHandlerDecorator(requestCoreFunc) {
  return async function errorHander(path, config) {
    const response = await requestCoreFunc(path, config);

    return response.status === 204 // NOTE: No content
      ? null
      : response;
    // NOTE: Handle Error response
  };
}

async function requestCore(path, config) {
  return axios({
    url: `${baseUrl}${path}`,
    ...attachAuthorizationHeader(config),
  });
}

const request = errorHandlerDecorator(requestCore);

export async function post(path, content) {
  const response = await request(path, {
    method: "post",
    data: queryString.stringify(content),
  });

  return response && response.data;
}

export async function get(path, queryParams = {}) {
  const qry = queryString.stringify(queryParams, { arrayFormat: "bracket" });
  const response = await request(`${path}${qry ? "?" : ""}${qry}`, {
    method: "get",
  });

  return response && response.data;
}

export async function put(path, content) {
  const response = await request(path, {
    method: "put",
    data: queryString.stringify(content),
  });

  return response && response.data;
}

export async function patch(path, content) {
  const response = await request(path, {
    method: "patch",
    data: queryString.stringify(content),
  });

  return response && response.data;
}

export async function del(path) {
  const response = await request(path, {
    method: "delete",
  });

  return response && response.data;
}
