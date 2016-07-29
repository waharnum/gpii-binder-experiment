/* globals fluid */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");

    // Component to test support for arrays
    fluid.defaults("gpii.tests.binder.array", {
        gradeNames: ["gpii.tests.binder.base"],
        bindings: [
            {
                selector: "initFromModel",
                path:     "initFromModel"
            },
            {
                selector: "initFromMarkup",
                path:     "initFromMarkup"
            },
            {
                selector: "updateFromModel",
                path:     "updateFromModel"
            },
            {
                selector: "updateFromMarkup",
                path:     "updateFromMarkup"
            }
        ]
    });

    fluid.defaults("gpii.tests.binder.array.environment", {
        gradeNames:       ["gpii.tests.binder.environment"],
        markupFixture:    ".viewport-array",
        binderGradeNames: ["gpii.tests.binder.array"],
        moduleName:       "Testing array notation",
        components: {
            startupTests: {
                type: "gpii.tests.binder.caseHolder.startup"
            },
            simpleRelayTests: {
                type: "gpii.tests.binder.caseHolder.simpleRelay"
            }
        }
    });

    gpii.tests.binder.array.environment();
})();
