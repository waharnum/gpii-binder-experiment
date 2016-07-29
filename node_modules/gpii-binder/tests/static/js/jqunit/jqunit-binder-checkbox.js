/* globals fluid */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");

// Component to test support for checkboxes
    fluid.defaults("gpii.tests.binder.checkbox", {
        gradeNames: ["gpii.tests.binder.base"],
        model: {
            initFromModel: ["on"]
        },
        selectors: {
            array: "input[name='checkbox-groups']"
        },
        bindings: {
            initFromModel: {
                selector: "initFromModel",
                path:     "initFromModel"
            },
            initFromMarkup: {
                selector: "initFromMarkup",
                path:     "initFromMarkup"
            },
            updateFromModel: {
                selector: "updateFromModel",
                path:     "updateFromModel"
            },
            updateFromMarkup: {
                selector: "updateFromMarkup",
                path:     "updateFromMarkup"
            },
            array: {
                selector: "array",
                path:     "array"
            }
        }
    });

    fluid.defaults("gpii.tests.binder.checkbox.caseHolder", {
        gradeNames: ["gpii.tests.binder.caseHolder"],
        rawModules: [{
            name: "Testing support for checkbox fields...",
            tests: [
                {
                    name: "Confirm that a single form update to the 'checkbox' component results in a model update...",
                    sequence: [
                        {
                            func: "gpii.tests.binder.clickSelector",
                            args: [".viewport-checkbox input[name='update-from-markup']"]
                        },
                        {
                            func: "jqUnit.assertDeepEq",
                            args: ["The 'checkbox' field should have been updated based on a form change...", ["updated using form controls"], "{testEnvironment}.binder.model.updateFromMarkup"]
                        }
                    ]
                },
                {
                    name: "Confirm that ticking multiple items in an array of checkboxes results in a model update...",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["array", []]
                        },
                        {
                            func: "gpii.tests.binder.clickSelector",
                            args: ["#checkbox-group-string"]
                        },
                        {
                            func: "gpii.tests.binder.clickSelector",
                            args: ["#checkbox-group-number"]
                        },
                        {
                            func: "gpii.tests.binder.clickSelector",
                            args: ["#checkbox-group-boolean"]
                        },
                        {
                            func: "jqUnit.assertDeepEq",
                            args: ["The 'checkbox' array should have been updated based on form changes...", ["a string", "42", "false"], "{testEnvironment}.binder.model.array"]
                        }
                    ]
                },
                {
                    name: "Confirm that ticking a single item in an array of checkboxes correctly updates the model...",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["array", []]
                        },
                        {
                            func: "gpii.tests.binder.clickSelector",
                            args: ["#checkbox-group-number"]
                        },
                        {
                            func: "jqUnit.assertDeepEq",
                            args: ["Selecting a single value should still result in an array of settings...", ["42"], "{testEnvironment}.binder.model.array"]
                        }
                    ]
                },
                {
                    name: "Test updating 'checkbox' form value using model change applier...",
                    sequence: [
                        {
                            func:    "{testEnvironment}.binder.applier.change",
                            args:     ["updateFromModel", "updated using applier"]
                        },
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertDeepEq", "The 'checkbox' form field should have been updated with new model data...", ["updated using applier"], "[name='update-from-model']"] // (fnName, message, expected, selector)
                        }
                    ]
                },
                {
                    name: "Test checking a single string value using the model change applier...",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["array", ["a string"]]
                        },
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertDeepEq", "The 'string' checkbox should be checked...", ["a string"], "[name='checkbox-groups']:checked"] // (fnName, message, expected, selector)
                        }
                    ]
                },
                {
                    name: "Test checking a single numeric value using the model change applier...",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["array", ["42"]]
                        },
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertDeepEq", "The 'number' checkbox should be checked...", ["42"], "[name='checkbox-groups']:checked"] // (fnName, message, expected, selector)
                        }
                    ]
                },
                {
                    name: "Test checking a single boolean value using the model change applier...",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["array", ["false"]]
                        },
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertDeepEq", "The 'boolean' checkbox should be checked...", ["false"], "[name='checkbox-groups']:checked"] // (fnName, message, expected, selector)
                        }
                    ]
                },
                {
                    name: "Test updating an array of 'checkbox' form values using model change applier...",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["array", ["42", "false", "a string"]]
                            // These should not be in the same order as the options appear in the markup, so that we
                            // can confirm that the presence of the value in the list is enough to indicate that its
                            // checkbox should be ticked.
                        },
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertDeepEq", "The 'checkbox' form field should have been updated with new model data...", ["a string", "42", "false"], "[name='checkbox-groups']:checked"] // (fnName, message, expected, selector)
                        }
                    ]
                }
            ]
        }]
    });

    fluid.defaults("gpii.tests.binder.checkbox.environment", {
        gradeNames:       ["gpii.tests.binder.environment"],
        markupFixture:    ".viewport-checkbox",
        binderGradeNames: ["gpii.tests.binder.checkbox"],
        moduleName:       "Testing checkbox support",
        components: {
            checkboxTests: {
                type: "gpii.tests.binder.checkbox.caseHolder"
            }
        }
    });

    gpii.tests.binder.checkbox.environment();
})();
