var Mocha = require('mocha');
var Promise = require('bluebird');

// Instantiate a Mocha instance.
var mocha = new Mocha();

var finalizeEach = require('./');

var finalizeDidRun = false;;
var finalizeError = null;
var runFlag = false;
var expectedError = null;

function setupTests() {
  it('with sync function', function() {
    runFlag = true;
  });
  
  it('with async function', function(done) {
    setTimeout(() => {
      runFlag = true;
      done();
    }, 20);
  });
  
  it('with Promise function', function() {
    return Promise.delay(20).then(() => {
      runFlag = true;
    });
  });
}

beforeEach(function() {
  finalizeDidRun = false;
  finalizeError = null;
  runFlag = false;
});

afterEach(function() {
  if(expectedError && !finalizeError) {
    throw new Error('Expected to get error: ' + expectedError.message);
  }
  if(expectedError && finalizeError && expectedError.message !== finalizeError.message) {
    throw new Error('Expected to get error: ' + expectedError.message);
  }
  if(!runFlag) {
    throw new Error('Actual test did not run');
  }
});

describe('finalizeEach', function() {
  describe('should run', function() {
    finalizeEach(this, promise => {
      return promise.catch(err => {
        finalizeError = err;
      }).finally(() => {
        finalizeDidRun = true;
      });
    });
    
    afterEach(function() {
      if(!finalizeDidRun) {
        throw new Error('Finalize should have run');
      }
    });
    
    setupTests();
    
    describe('with embedded describe', function() {
      setupTests();
    });
    describe('with embedded describe twice', function() {
      describe('embedded', function() {
        setupTests();
      });
    });
  });
  
  describe('should not run', function() {    
    afterEach(function() {
      if(finalizeDidRun) {
        throw new Error('Finalize should not have run');
      }
    });
    
    setupTests();
  });
  
  describe('should handle errors', function() {
    finalizeEach(this, promise => {
      return promise.catch(err => {
        finalizeError = err;
      }).finally(() => {
        finalizeDidRun = true;
      });
    });
    
    const error = new Error('foo');
    before(function() {
      expectedError = error;
    });
    
    it('with sync function', function() {
      runFlag = true;
      throw error;
    });
    
    it('with async function', function(done) {
      setTimeout(() => {
        runFlag = true;
        done(error);
      }, 20);
    });
    
    it('with Promise function', function() {
      return Promise.delay(20).then(() => {
        runFlag = true;
        throw error;
      });
    });
  });
});
