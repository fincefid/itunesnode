const express = require('express');
const validate = require('express-validation');
const validation = require('./validation/postReceipt.js');
const app = express();
const port = require('config').server.port;
const service = require('./service');

app.use(require('body-parser').json());

app.post('/verifyReceipt', validate(validation), function(req, res) {
  service.verify(req.body, function(err, result) {
    if (err) {
      if (err.code === "UnsuccessfulAppleResponse") res.statusCode = 500;
      else if (err.code === "TransactionNotFound") res.statusCode = 404;
      else if (err.code === "InvalidResponse") res.statusCode = 502;
      else if (err.code === "ReceiptStatusNotValid") res.statusCode = 422;
      else if (err.code === "ServiceCallFailed") res.statusCode = 503;
      else res.statusCode = 503;
      return res.json({error: err.message});
    }

    res.json(result);
  });
});

module.exports = app.listen(port, () => {console.log('iTunes Adapter started on: ' + port);});
