const config = require('config');
const request = require('request');

function handleResponse(cb) {
  return function(err, res, body) {
    if (err) {
      console.error(err);
      return cb(new ApiError("ServiceCallFailed", "Cannot get response from Apple"));
    }

    if (res.statusCode / 100 !== 2) {
      return cb(new ApiError("UnsuccessfulAppleResponse", "Unsuccessful response status from Apple: " + res.statusCode));
    }

    if (!isValidJsonObj(body)) {
      console.error("Cannot parse response from Apple", body);
      return cb(new ApiError("InvalidResponse", "Cannot parse response from Apple"));
    }

    if (body.status !== 0) {
      return cb(new ApiError("ReceiptStatusNotValid", "Receipt status code is invalid: " + body.status));
    }

    return cb(null, body.latest_receipt_info);
  };
}

function isValidJsonObj(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

module.exports.verify = function(req, cb) {
  request.post({
    url: config.apple.url,
    body: {'receipt-data': req.transaction, password: config.apple.password, 'exclude-old-transactions': true},
    json: true
  }, handleResponse(cb));
};

class ApiError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }
}

module.exports.ApiError = ApiError;
