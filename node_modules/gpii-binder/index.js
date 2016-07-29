/* eslint-env node */
"use strict";
var fluid = require("infusion");
var gpii  = fluid.registerNamespace("gpii");

// Register our content so that it can be referenced in other packages using `fluid.module.resolvePath("%gpii-binder/path/to/content")`
fluid.module.register("gpii-binder", __dirname, require);

// Create a stub to consistently load our test fixtures for use in other packages.
fluid.registerNamespace("gpii.binder");
gpii.binder.loadTestingSupport = function () {
    require("./src/tests/instrumentedTestem");
};

