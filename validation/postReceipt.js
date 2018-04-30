var Joi = require('joi');

module.exports = {
  headers: {
    'x-skyint-requestid': Joi.string().required(),
    'content-type' : Joi.string().valid("application/json").required()
  },
  body: {
    transactions: Joi.array().length(1).items(Joi.object({
      transaction: Joi.string().required(),
      transactionId: Joi.string().required()
    }))
  }
};
