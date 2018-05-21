var Joi = require('joi');

module.exports = {
  headers: {
    'x-skyint-requestid': Joi.string().required(),
    'content-type': Joi.string().valid("application/json").required()
  },
  body: {
    transaction: Joi.string().required(),
    transactionId: Joi.string().required()
  }
};
