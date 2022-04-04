import woo from './helper/woo';

export default class Coupon {
  static getCoupons() {
    return new Promise((resolve, reject) => {
      woo
        .get('coupons', {
          per_page: 100,
        })
        .then((coupons) => {
          resolve({data: coupons});
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static addCoupon(body) {
    return new Promise((resolve, reject) => {
      let newBody = {...body};
      delete newBody.id;
      woo
        .post('coupons', newBody)
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

  static deleteCoupon(id) {
    return new Promise((resolve, reject) => {
      woo
        .delete('coupons/' + id)
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

  static editCoupon(params) {
    return new Promise((resolve, reject) => {
      woo
        .put('coupons/' + params.id, params)
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
