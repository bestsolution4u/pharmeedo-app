import woo from './helper/woo';

export default class Product {
  static getAllProducts() {
    return new Promise((resolve, reject) => {
      woo
        .get('products', {
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

  static addProduct(body) {
    return new Promise((resolve, reject) => {
      let newBody = {...body};
      delete newBody.id;

      woo
        .post('products', newBody)
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

  static deleteProduct(id) {
    return new Promise((resolve, reject) => {
      woo
        .delete('products/' + id)
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

  static editProduct(params) {
    return new Promise((resolve, reject) => {
      woo
        .put('products/' + params.id, params)
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
