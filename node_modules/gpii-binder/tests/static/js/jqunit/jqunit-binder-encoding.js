/* globals fluid, jqUnit */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");

// Component to test support for encoded "typed" data
    fluid.defaults("gpii.tests.binder.encoding", {
        gradeNames: ["gpii.binder.bindOnCreate"],
        model: {},
        selectors: {
            "number-from-markup": "[name='number-from-markup']",
            "number-select": ".number-select",
            "false-from-markup": "[name='false-from-markup']",
            "false-from-model": "[name='false-from-model']",
            "zero-from-markup": "[name='zero-from-markup']",
            "null-from-markup": "[name='null-from-markup']",
            "falsy-select": ".falsy-select",
            "object-from-markup": "[name='object-from-markup']",
            "array-from-markup": "[name='array-from-markup']"
        },
        bindings: {
            "number-from-markup": {
                path: "number-from-markup",
                selector: "number-from-markup",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type: "fluid.transforms.stringToNumber",
                                inputPath: ""
                            }
                        }
                    }
                }
            },
            "number-select": {
                path: "number-select",
                selector: "number-select",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type:  "fluid.transforms.stringToNumber",
                                inputPath: ""
                            }
                        }
                    },
                    modelToDom: {
                        "": {
                            transform: {
                                type: "fluid.transforms.stringToNumber",
                                inputPath: ""
                            }
                        }
                    }
                }
            },
            "false-from-markup": {
                path: "false-from-markup",
                selector: "false-from-markup",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type:  "gpii.binder.transforms.stringToBoolean",
                                inputPath: ""
                            }
                        }
                    }
                }
            },
            "false-from-model": {
                path: "false-from-model",
                selector: "false-from-model",
                rules: {
                    modelToDom: {
                        "": {
                            transform: {
                                type:  "gpii.binder.transforms.booleanToString",
                                inputPath: ""
                            }
                        }
                    }
                }
            },
            "zero-from-markup": {
                path: "zero-from-markup",
                selector: "zero-from-markup",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type: "fluid.transforms.stringToNumber",
                                inputPath: ""
                            }
                        }
                    }
                }
            },
            "null-from-markup": {
                path: "null-from-markup",
                selector: "null-from-markup",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type: "gpii.binder.transforms.stringToObject",
                                inputPath: ""
                            }
                        }
                    }
                }
            },
            "falsy-select": {
                path: "falsy-select",
                selector: "falsy-select",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type:  "gpii.binder.transforms.stringToBoolean",
                                inputPath: ""
                            }
                        }
                    },
                    modelToDom: {
                        "": {
                            transform: {
                                type:  "gpii.binder.transforms.booleanToString",
                                inputPath: ""
                            }
                        }
                    }
                }
            },
            "object-from-markup": {
                path: "object-from-markup",
                selector: "object-from-markup",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type:  "gpii.binder.transforms.stringToObject",
                                inputPath: ""
                            }
                        }
                    }
                }
            },
            "array-from-markup": {
                path: "array-from-markup",
                selector: "array-from-markup",
                rules: {
                    domToModel: {
                        "": {
                            transform: {
                                type:  "gpii.binder.transforms.stringToObject",
                                inputPath: ""
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("gpii.tests.binder.encoding.caseHolder", {
        gradeNames: ["gpii.tests.binder.caseHolder"],
        rawModules: [{
            name: "Testing support for encoding non-string data...",
            tests: [
                {
                    name: "Encoded variables in the initial markup should be passed to the model correctly...",
                    sequence: [
                        {
                            func: "jqUnit.assertEquals",
                            args: ["A number in the initial markup should be a number in the model...", 3, "{testEnvironment}.binder.model.number-from-markup"]
                        },
                        {
                            func: "jqUnit.assertEquals",
                            args: ["A false value in the initial markup should be false in the model...", false, "{testEnvironment}.binder.model.false-from-markup"]
                        },
                        {
                            func: "jqUnit.assertEquals",
                            args: ["A zero in the initial markup should be a number in the model...", 0, "{testEnvironment}.binder.model.zero-from-markup"]
                        },
                        {
                            func: "jqUnit.assertEquals",
                            args: ["A null value in the initial markup should not be set in the model...", undefined, "{testEnvironment}.binder.model.null-from-markup"]
                        },
                        {
                            func: "jqUnit.assertDeepEq",
                            args: ["An array in the initial markup should be an object in the model...", ["foo", "bar"], "{testEnvironment}.binder.model.array-from-markup"]
                        },
                        {
                            func: "jqUnit.assertDeepEq",
                            args: ["An object in the initial markup should be an object in the model...", {"foo": "bar"}, "{testEnvironment}.binder.model.object-from-markup"]
                        }
                    ]
                },
                {
                    name: "Confirm that picking a numeric value from a list results in a model update...",
                    type: "test",
                    sequence: [
                        {
                            func: "fluid.changeElementValue",
                            args: [".number-select", 2]
                        },
                        {
                            func: "jqUnit.assertEquals",
                            args: ["The model data should be set to the correct number...", 2, "{testEnvironment}.binder.model.number-select"]
                        }
                    ]
                },
                {
                    name: "Confirm that setting a number value via a model update results in a form change...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["number-select", 1]
                        },
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertEquals", "The form element should have been updated...", "1", ".number-select"] // (fnName, message, expected, selector)
                        }
                    ]
                },
                {
                    name: "Confirm that picking a 'falsy' value from a list results in a model update...",
                    type: "test",
                    sequence: [
                        // NOTE: This must be a string because jQuery's val() function works with strings, arrays, and objects, but not `false`.
                        {
                            func: "fluid.changeElementValue",
                            args: [".falsy-select", "false"]
                        },
                        {
                            func: "jqUnit.assertEquals",
                            args: ["The model data should be set to false...", false, "{testEnvironment}.binder.model.falsy-select"]
                        },
                        {
                            func: "fluid.changeElementValue",
                            args: [".falsy-select", 0]
                        },
                        {
                            func: "jqUnit.assertEquals",
                            args: ["The model data should be set to false...", false, "{testEnvironment}.binder.model.falsy-select"]
                        },
                        {
                            func: "fluid.changeElementValue",
                            args: [".falsy-select", null]
                        },
                        {
                            func: "jqUnit.assertEquals",
                            args: ["The model data should be set to false...", false, "{testEnvironment}.binder.model.falsy-select"]
                        }
                    ]
                },
                {
                    name: "Confirm that setting a 'falsy' value via a model update results in a form change...",
                    type: "test",
                    sequence: [
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["false-from-model", false]
                        },
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertEquals", "The form element should have been updated...", "false", "[name='false-from-model']"] // (fnName, message, expected, selector)
                        }
                    ]
                }
            ]
        }]
    });

    fluid.defaults("gpii.tests.binder.encoding.environment", {
        gradeNames: ["gpii.tests.binder.environment"],
        markupFixture: ".viewport-encoding",
        binderGradeNames: ["gpii.tests.binder.encoding"],
        moduleName: "Testing encoding support",
        components: {
            encodingTests: {
                type: "gpii.tests.binder.encoding.caseHolder"
            }
        }
    });
    jqUnit.module("foo");
    gpii.tests.binder.encoding.environment();
})();
