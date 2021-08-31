function arr_diff(a1, a2) {
  var a = [],
    diff = [];

  for (var i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }

  for (var k in a) {
    diff.push(k);
  }

  return diff;
}

/**
 * Pospones by duration the callback cbObject.cb with cbObject.params parameters
 * @param {ITimer} iTimer
 * @param {number} durationMillis
 * @param {CbObject} cbObject
 */
const posponeTimeout = (iTimer, durationMillis, cbObject) => {
  if (iTimer.timer != null) {
    // clear the Timeout so the previous one is canceled and does not take effect
    clearTimeout(iTimer.timer);

    // this is what to perform after the new timeout defined below
    const action = () => {
      const {
        cb,

        // if no params are passed through the cbObject,
        // set an empty list of params
        params = [],
      } = cbObject;

      // call the function with the given params
      cb(...params);
    };

    // pass out a newer timeout to the same property.
    // And trigger the action after durationMillis duration.
    iTimer.timer = setTimeout(action, durationMillis);
  }
};

module.exports = { arr_diff, posponeTimeout };
