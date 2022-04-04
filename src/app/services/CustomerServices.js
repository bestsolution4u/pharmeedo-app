import woo from './helper/woo';

export default class Customer {
  static getCustomers() {
    return new Promise((resolve, reject) => {
      woo
        .get('customers', {
          per_page: 100,
        })
        .then((customers) => {
          resolve({data: customers});
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static addCustomer(body) {
    return new Promise((resolve, reject) => {
      let newBody = {...body};
      delete newBody.id;
      woo
        .post('customers', newBody)
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

  static deleteCustomer(id) {
    return new Promise((resolve, reject) => {
      woo
        .delete('customers/' + id)
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

  static editCustomer(params) {
    return new Promise((resolve, reject) => {
      woo
        .put('customers/' + params.id, params)
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
