/* globals fluid */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");

    // Component to test "short notation"
    fluid.defaults("gpii.tests.binder.short", {
        gradeNames: ["gpii.tests.binder.base"],
        bindings: {
            initFromModel:    "initFromModel",
            initFromMarkup:   "initFromMarkup",
            updateFromModel:  "updateFromModel",
            updateFromMarkup: "updateFromMarkup",
            missingElement:   "missingElement"
        }
    });

    fluid.defaults("gpii.tests.binder.short.environment", {
        gradeNames:       ["gpii.tests.binder.environment"],
        moduleName:       "Testing binder component (short notation)",
        markupFixture:    ".viewport-short",
        binderGradeNames: ["gpii.tests.binder.short"],
        components: {
            startupTests: {
                type: "gpii.tests.binder.caseHolder.startup"
            },
            simpleRelayTests: {
                type: "gpii.tests.binder.caseHolder.simpleRelay"
            }
        }
    });

    gpii.tests.binder["short"].environment();
})();
