var Promise = require('bluebird');

module.exports = function finalizeEach(suite, wrapper) {
  suite.on('suite', childSuite => {
    finalizeEach(childSuite, wrapper);
  })
  
  suite.on('test', test => {
    if(!test.fn){
      return;
    }
    var originalFn = test.fn;
    
    if(originalFn.length > 0) {
      test.fn = function(done) {
        wrapper(Promise.fromCallback(done => {
          return originalFn.call(this, done);
        })).asCallback(done);
      };
    } else {
      test.fn = function() {
        return wrapper(Promise.try(() => originalFn.call(this)));
      };
    }
  });
};
