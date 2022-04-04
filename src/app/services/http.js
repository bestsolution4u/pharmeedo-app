import axios from 'axios';
import serializeError from 'serialize-error';
import {get} from 'lodash';
import env from 'react-native-config';

const API_ROOT = env.DOMAIN_API;

axios.defaults.baseURL = API_ROOT + '/wp-json/mposs/api/';
axios.defaults.timeout = 30000;
axios.defaults.headers.mobile = true;

axios.interceptors.request.use(
  (config) => {
    config.headers = {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    };
    console.log("Request: ", config);
    return config;
  },
  (error) => {
    console.log("Error: ", error);
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    console.log("Response: ", response);
    return response;
  },
  (error) => {
    console.log("Error: ", error);
    const message = serializeError(error);
    return Promise.reject(get(message, 'response.data.message', error));
  },
);

const http = {
  setAuthorizationHeader(accessToken) {
    axios.defaults.headers.Authorization = `Bearer ${accessToken}`;
  },
  request(config = {}) {
    return axios.request(config);
  },
  get(url, config = {}) {
    return axios.get(url, config);
  },
  post(url, data = {}, config = {}) {
    return axios.post(url, data, config);
  },
  put(url, data = {}, config = {}) {
    return axios.put(url, data, config);
  },
  patch(url, data = {}, config = {}) {
    return axios.patch(url, data, config);
  },
  delete(url, config = {}) {
    return axios.delete(url, config);
  },
};

export default http;
