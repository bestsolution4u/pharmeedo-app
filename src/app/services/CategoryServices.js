import woo from './helper/woo';

export default class Category {
  static getCategories() {
    return new Promise((resolve, reject) => {
      woo
        .get('products/categories', {
          per_page: 100,
        })
        .then((categories) => {
          resolve({data: categories});
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static addCategory(body) {
    return new Promise((resolve, reject) => {
      woo
        .post('products/categories', body)
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

  static deleteCategory(id) {
    return new Promise((resolve, reject) => {
      woo
        .delete('products/categories/' + id)
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

  static editCategory(params) {
    return new Promise((resolve, reject) => {
      woo
        .put('products/categories/' + params.id, params)
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
