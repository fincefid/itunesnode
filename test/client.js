const assert = require('assert');
const client = require('../client');
const fs = require('fs');
const sinon = require('sinon');
const request = require('request');

let latestReceipts = [{
  original_transaction_id: "1000000388809690",
  product_id: 'com.bskyb.skysportstv.iap.monthly.limapack2',
  transaction_id: '1000000388825861'
}];
let appleResponse = JSON.parse(fs.readFileSync('./test/fixtures/appleResponse.json'));
appleResponse.latest_receipt_info = latestReceipts;

describe('Client', function() {
  beforeEach(function() {
    sinon.stub(request, 'post').yields(null, null, null);
  });

  afterEach(function () {
    request.post.restore();
  });

  it('returns latest receipt info', function(done) {
    request.post.yields(null, {"statusCode": 200}, appleResponse);
    client.verify({"transaction": "receipt"}, function(err, latest_receipt_info) {
      assert.equal(latest_receipt_info, latestReceipts);
      done(err);
    });
  });

  it('returns error when service call fails', function(done) {
    request.post.yields(new Error("Cannot make a call!"), null, null);
    client.verify({"transaction": "receipt"}, function(err, latest_receipt_info) {
      assert.equal(err.code, 'ServiceCallFailed');
      done();
    });
  });

  it('returns error when response status is not OK', function(done) {
    request.post.yields(null, {"statusCode": 503}, null);
    client.verify({"transaction": "receipt"}, function(err, latest_receipt_info) {
      assert.equal(err.code, 'UnsuccessfulAppleResponse');
      done();
    });
  });

  it('returns error when response is not valid json', function(done) {
    request.post.yields(null, {"statusCode": 200}, "");
    client.verify({"transaction": "receipt"}, function(err, latest_receipt_info) {
      assert.equal(err.code, 'InvalidResponse');
      done();
    });
  });

  it('returns error when response status is not 0', function(done) {
    appleResponse.status = 21001;
    request.post.yields(null, {"statusCode": 200}, appleResponse);
    client.verify({"transaction": "receipt"}, function(err, latest_receipt_info) {
      assert.equal(err.code, 'ReceiptStatusNotValid');
      done();
    });
  });
});
