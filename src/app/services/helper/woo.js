import env from 'react-native-config';
import WooCommerceAPI from './WooCommerceAPI';

const _api = new WooCommerceAPI({
  url: env.DOMAIN_API,
  consumerKey: env.CONSUMER_KEY,
  consumerSecret: env.CONSUMER_SECRET,
  wpAPI: true,
  version: 'wc/v3',
  queryStringAuth: true,
});

const http = {
  get(url, config = {}) {
    return _api.get(url, config);
  },
  post(url, data = {}, version = null) {
    return _api.post(url, data, version);
  },
  put(url, data = {}, version = null) {
    return _api.put(url, data, version);
  },
  patch(url, data = {}, version = null) {
    return _api.patch(url, data, version);
  },
  delete(url, version = null) {
    return _api.delete(url, version);
  },
};

export default http;
