/* globals fluid */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");

    // Component to test support for textarea elements
    fluid.defaults("gpii.tests.binder.textarea", {
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

    fluid.defaults("gpii.tests.binder.textarea.environment", {
        gradeNames:       ["gpii.tests.binder.environment"],
        markupFixture:    ".viewport-textarea",
        binderGradeNames: ["gpii.tests.binder.textarea"],
        moduleName:       "Testing textarea form inputs",
        components: {
            startupTests: {
                type: "gpii.tests.binder.caseHolder.startup"
            },
            simpleRelayTests: {
                type: "gpii.tests.binder.caseHolder.simpleRelay"
            }
        }
    });

    gpii.tests.binder.textarea.environment();
})();
