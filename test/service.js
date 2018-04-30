const assert = require('assert');
const service = require('../service');
const client = require('../client');
const sinon = require('sinon');

let latestReceipts = [{
    original_transaction_id: '1000000388809690',
    product_id: 'com.bskyb.skysportstv.iap.monthly.limapack2',
    transaction_id: '1000000388825861'
  },
  {
    original_transaction_id: '1000000388809690',
    product_id: 'com.bskyb.skysportstv.iap.monthly.limapack2',
    transaction_id: '48'
  }
];

describe('Service', function() {
  beforeEach(function() {
    sinon.stub(client, 'verify');
  });

  afterEach(function() {
    client.verify.restore();
  });

  it('finds the receipt by transaction id', function(done) {
    client.verify.yields(null, latestReceipts);
    service.verify({transactionId: "1000000388825861"}, function(err, result) {
      assert.deepEqual(result, {
        partnerSubscriptionId: '1000000388809690',
        partnerTransactionId: '1000000388825861',
        productId: 'com.bskyb.skysportstv.iap.monthly.limapack2',
      });
      done(err);
    });
  });

  it('returns error if transaction id not found', function(done) {
    client.verify.yields(null, latestReceipts);
    service.verify({transactionId: "123"}, function(err, result) {
      assert.equal(err.code, 'TransactionNotFound');
      done();
    });
  });

  it('returns error if mandatory fields are missing', function(done) {
    latestReceipts[1].original_transaction_id = null;
    latestReceipts[1].product_id = null;
    client.verify.yields(null, latestReceipts);
    service.verify({transactionId: "48"}, function(err, result) {
      assert.equal(err.code, 'InvalidResponse');
      done();
    });
  });
});
