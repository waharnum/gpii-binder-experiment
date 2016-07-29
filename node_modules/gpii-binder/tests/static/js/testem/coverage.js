/*

    Client-side wiring to relay coverage data from individual tests to istanbul.  Copied from Testem's examples:

    https://github.com/testem/testem/blob/master/examples/coverage_istanbul/tests.html

    Testem is MIT licensed, details here:  https://github.com/testem/testem/blob/master/LICENSE.md

    To use this file, you will also need to:

    1. launch istanbul before running your tests.
    2. Instrument your code.
    3. Source the instrumented version of your code in your tests.
    4. Combine and collate the individual coverage reports after all tests complete.

    See the `testem.js` file in this repo for an example.

*/
/* globals Testem, window, XMLHttpRequest */
(function () {
    "use strict";
    Testem.afterTests(
        function (config, data, callback) {
            var coverage = JSON.stringify(window.__coverage__);
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    callback();
                }
            };
            xhr.open("POST", "/coverage", true);
            xhr.send(coverage);
        }
    );
})();

