const client = require('./client');

module.exports.verify = function(request, cb) {
  client.verify(request, function(err, latestReceipts) {
    if (err) return cb(err);

    let found = latestReceipts.find(r => r.transaction_id === request.transactionId);
    if (!found) return cb(new client.ApiError("TransactionNotFound", request.transactionId + " did not match any receipts in the Apple response"));
    if (!found.original_transaction_id || !found.product_id) {
      return cb(new client.ApiError("InvalidResponse", "Cannot parse response from Apple"));
    }

    return cb(null, {
      partnerSubscriptionId: found.original_transaction_id,
      partnerTransactionId: found.transaction_id,
      productId: found.product_id
    });
  });
};
