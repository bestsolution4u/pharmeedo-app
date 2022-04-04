import woo from './helper/woo';

export default class Order {
  static getAllOrders() {
    return new Promise((resolve, reject) => {
      woo
        .get('orders', {
          per_page: 100,
        })
        .then((products) => {
          resolve({data: products});
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static addOrder(body) {
    return new Promise((resolve, reject) => {
      woo
        .post('orders', body)
        .then((res) => {
          if (res.message) {
            reject(res.message);
          } else {
            resolve({data: res});
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
