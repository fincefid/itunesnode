const assert = require('assert');
const service = require('../service');
const server = require('../server');
const sinon = require('sinon');
const request = require('supertest');

let validPayload = {
	transactions: [
		{
			transaction: "123==",
			transactionId: "1000000388825861"
		}
	]
};
let validRequest;

describe('Server', function() {
  beforeEach(function() {
    sinon.stub(service, 'verify');

    validRequest = request(server)
        .post('/verifyReceipt')
        .set('X-SkyInt-RequestID', '123')
        .set('Content-Type', 'application/json')
        .send(validPayload)
  });

  afterEach(function() {
    service.verify.restore();
  });

  it('returns sucess when service verifies the receipt', function(done) {
    service.verify.yields(null, {result: ""});
    validRequest
      .expect(200)
      .end(function(err, res) {
        assert.deepEqual(res.body, {result: ""})
        done(err)
      });
  });

  it('returns 400 when header is missing', function(done) {
    service.verify.yields(null, {result: ""});
    request(server)
      .post('/verifyReceipt')
      .send(validPayload)
      .expect(400)
      .end(function(err, res) {
        done(err)
      });
  });

  it('returns 500 when service fails with UnsuccessfulAppleResponse', function(done) {
    service.verify.yields({code: 'UnsuccessfulAppleResponse'}, null);
    validRequest
      .expect(500)
      .end(function(err, res) {
        done(err)
      });
  });

  it('returns 404 when service fails with TransactionNotFound', function(done) {
    service.verify.yields({code: 'TransactionNotFound'}, null);
    validRequest
      .expect(404)
      .end(function(err, res) {
        done(err)
      });
  });

  it('returns 502 when service fails with InvalidResponse', function(done) {
    service.verify.yields({code: 'InvalidResponse'}, null);
    validRequest
      .expect(502)
      .end(function(err, res) {
        done(err)
      });
  });

  it('returns 422 when service fails with ReceiptStatusNotValid', function(done) {
    service.verify.yields({code: 'ReceiptStatusNotValid'}, null);
    validRequest
      .expect(422)
      .end(function(err, res) {
        done(err)
      });
  });

  it('returns 503 when service fails with ServiceCallFailed', function(done) {
    service.verify.yields({code: 'ServiceCallFailed'}, null);
    validRequest
      .expect(503)
      .end(function(err, res) {
        done(err)
      });
  });

  it('returns 503 when service fails with unexpected error', function(done) {
    service.verify.yields(new Error('unexpected!'), null);
    validRequest
      .expect(503)
      .end(function(err, res) {
        done(err)
      });
  });
});
