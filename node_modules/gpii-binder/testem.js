// Adapted from node ./node_modules/istanbul/lib/cli.js report
/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

require("./index");

gpii.binder.loadTestingSupport();

var outputFile = fluid.module.resolvePath("%gpii-binder/report.tap");

var testemHarness = gpii.test.testem.instrumented({
    testPages: [
        "tests/static/tests-binder-array.html",
        "tests/static/tests-binder-bindOnDomChange.html",
        "tests/static/tests-binder-checkbox.html",
        "tests/static/tests-binder-clear.html",
        "tests/static/tests-binder-encoding.html",
        "tests/static/tests-binder-long.html",
        "tests/static/tests-binder-radio.html",
        "tests/static/tests-binder-select.html",
        "tests/static/tests-binder-short.html",
        "tests/static/tests-binder-textarea.html"
    ],
    testemOptions: {
        "framework":   "qunit",
        "parallel":    1,
        "report_file": outputFile
    }
});
module.exports = testemHarness.options.testemOptions;
