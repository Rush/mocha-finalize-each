# mocha-finalize-each
Finalize each test in a mocha test suite and conditionally fail. This is a better afterEach. Stock `afterEach` halts the whole suite https://github.com/mochajs/mocha/issues/1635 in case of any `afterEach` failure

## Example

Below supports all types of tests: sync, async and promises. It unifies them to use promises so that `finalizeEach` can have a uniform interface.

```js
var finalizeEach = require('mocha-finalize-each');

describe('some tests', function() {
  var sinonSandbox = sinon.sandbox.create();

  finalizeEach(this, promise => {
    // note: always return a promise here
    // note2: if you .catch an error and don't re-throw it your tests will always pass
    return promise.then(() => {
      // will fail tests if sinon assertions are not satisfied
      sinonSandbox.verifyAndRestore();
    }).finally(() => {
      // clean in all cases
      sinonSandbox.restore();
    });
  });

  it('some test', function() {
     /* ...  some code using sinonSandbox */
  });
});
```
