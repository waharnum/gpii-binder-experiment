/*

    A test environment, caseHolder, and reusable common tests for use in our test suite.

 */
/* eslint-env node */
/* globals fluid, $, jqUnit, QUnit */
"use strict";
var gpii = fluid.registerNamespace("gpii");

// Base viewComponent used in most tests.
fluid.defaults("gpii.tests.binder.base", {
    gradeNames: ["gpii.binder.bindOnCreate"],
    model: {
        initFromModel:    "initialized from model" // The markup will be initialized with this value.
    },
    selectors: {
        initFromModel:    "[name='init-from-model']",
        initFromMarkup:   "[name='init-from-markup']",
        updateFromModel:  "[name='update-from-model']",
        updateFromMarkup: "[name='update-from-markup']",
        missingElement:   ".not-found-at-all"
    }
});

fluid.registerNamespace("gpii.tests.binder");

// Client-side function to retrieve a value by a selector from within an IoC test.
gpii.tests.binder.getElementValue = function (selector) {
    return fluid.value($(selector));
};

// Client-side function to click a selector
gpii.tests.binder.clickSelector = function (selector) {
    $(selector).click();
};

// Client side one-shot element test, which can use most jqUnit functions.
gpii.tests.binder.testElement = function (fnName, message, expected, selector) {
    var value = gpii.tests.binder.getElementValue(selector);
    jqUnit[fnName](message, expected, value);
};

fluid.registerNamespace("gpii.tests.binder.caseHolder");
gpii.tests.binder.caseHolder.prependModuleName = function (that) {
    if (that.options.modules) {
        return that.options.modules;
    }
    else if (that.options.rawModules) {
        if (that.options.moduleName) {
            var processedModules = [];
            fluid.each(that.options.rawModules, function (module) {
                var processedModule = fluid.copy(module);
                var processedTests = [];
                fluid.each(module.tests, function (testDef) {
                    var processedTest = fluid.copy(testDef);
                    processedTest.name = that.options.moduleName + ": " + testDef.name;
                    processedTests.push(processedTest);
                });
                processedModule.tests = processedTests;
                processedModules.push(processedModule);
            });

            return processedModules;
        }
        else {
            return that.options.rawModules;
        }
    }
};

// A common caseHolder for all tests.  As we reuse many of these tests, supports prepending an identifier to all tests
// names, which makes it easier to identify failures in a particular variation.
fluid.defaults("gpii.tests.binder.caseHolder", {
    gradeNames: ["fluid.test.testCaseHolder"],
    mergePolicy: {
        rawModules:    "noexpand"
    },
    moduleSource: {
        funcName: "gpii.tests.binder.caseHolder.prependModuleName",
        args:     ["{that}"]
    }
});

// Common tests to confirm that variables are populated correctly on startup...
fluid.defaults("gpii.tests.binder.caseHolder.startup", {
    gradeNames: ["gpii.tests.binder.caseHolder"],
    rawModules: [{
        name: "Common startup tests...",
        tests: [
            {
                name: "Confirm that bindings are passed correctly on initialization...",
                type: "test",
                sequence: [
                    {
                        func: "gpii.tests.binder.testElement",
                        args: ["assertEquals", "A form element with no markup value should be correctly initialized...", "initialized from model", "[name='init-from-model']"] // (fnName, message, expected, selector)
                    },
                    {
                        func: "jqUnit.assertEquals",
                        args: [ QUnit.config.currentModule + ": Model data should be correctly initialized from markup values...", "initialized from markup", "{testEnvironment}.binder.model.initFromMarkup"]
                    }
                ]
            }
        ]
    }]
});

// Common tests for many variations (form field type, etc.)
fluid.defaults("gpii.tests.binder.caseHolder.simpleRelay", {
    gradeNames: ["gpii.tests.binder.caseHolder"],
    rawModules: [
        {
            name: "Common tests for gpii-binder...",
            tests: [
                {
                    name: "Confirm that a form update results in a model update...",
                    type: "test",
                    sequence: [
                        {
                            func: "fluid.changeElementValue",
                            args: ["[name='update-from-markup']", "updated via form element"]
                        },
                        {
                            func: "jqUnit.assertEquals",
                            args: [ QUnit.config.currentModule + ": Model data should be correctly updated after a form field change...", "updated via form element", "{testEnvironment}.binder.model.updateFromMarkup"]
                        }
                    ]
                },
                {
                    name: "Confirm that a model update results in a form change...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["updateFromModel", "updated from model"]
                        },
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertEquals", "A form element should be updated after a model change...", "updated from model", "[name='update-from-model']"] // (fnName, message, expected, selector)
                        }
                    ]
                }
            ]
        }
    ]
});

/*

    A test environment that lets us try variations on our component using different container and grade combinations.

 */
fluid.defaults("gpii.tests.binder.environment", {
    gradeNames: ["fluid.test.testEnvironment"],
    binderGradeNames: [],
    // If `moduleName` is set, distribute that to all caseHolders so that they can prepend it to their test names.
    distributeOptions: {
        source: "{that}.options.moduleName",
        target: "{that gpii.tests.binder.caseHolder}.options.moduleName"
    },
    components: {
        binder: {
            type:      "fluid.viewComponent",
            container: "{gpii.tests.binder.environment}.options.markupFixture",
            options: {
                gradeNames: "{gpii.tests.binder.environment}.options.binderGradeNames"
            }
        }
    }
});
