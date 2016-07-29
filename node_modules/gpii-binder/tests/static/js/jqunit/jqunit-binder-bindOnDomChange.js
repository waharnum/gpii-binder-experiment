/* globals fluid */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");


    // bindOnDomChange
    // gpii.binder.bindOnDomChange
    // <input type="text" name="bound-text-field"/>

    fluid.registerNamespace("gpii.tests.binder.bindOnDomChange.testComponent");

    gpii.tests.binder.bindOnDomChange.testComponent.changeMarkup = function (that, selector, markup) {
        var element = that.locate(selector);
        element.html(markup);
        that.events.onDomChange.fire(that);
    };

    fluid.defaults("gpii.tests.binder.bindOnDomChange.testComponent", {
        gradeNames: ["gpii.binder.bindOnCreate", "gpii.binder.bindOnDomChange"],
        model: {
            textField: "initial value"
        },
        selectors: {
            textField: "input[name='bound-text-field']"
        },
        bindings: {
            textField: {
                selector: "textField",
                path:     "textField"
            }
        },
        invokers: {
            changeMarkup: {
                funcName: "gpii.tests.binder.bindOnDomChange.testComponent.changeMarkup",
                args: ["{that}", "textField", "<p>Updated Markup</p><input type=\"text\" name=\"bound-text-field\"/>"]
            }
        }
    });

    fluid.defaults("gpii.tests.binder.bindOnDomChange.caseHolder", {
        gradeNames: ["gpii.tests.binder.caseHolder"],
        rawModules: [{
            name: "Testing support for 'bind on dom change' grade...",
            tests: [
                {
                    name: "Confirm that bindings persist across DOM changes...",
                    type: "test",
                    sequence: [
                        // Confirm that the initial value is set correctly on startup
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertEquals", "The form value should be correct on startup...", "initial value", "[name='bound-text-field']"] // (fnName, message, expected, selector)
                        },
                        // Reset the markup
                        {
                            func: "{testEnvironment}.binder.changeMarkup"
                        },
                        // Apply a model change
                        {
                            func: "{testEnvironment}.binder.applier.change",
                            args: ["textField", "updated value"]
                        },
                        // Confirm that the model change has taken effect
                        {
                            func: "gpii.tests.binder.testElement",
                            args: ["assertEquals", "A form element should be updated after a model change...", "updated value", "[name='bound-text-field']"] // (fnName, message, expected, selector)
                        }
                    ]
                }
            ]
        }]
    });

    fluid.defaults("gpii.tests.binder.bindOnDomChange.environment", {
        gradeNames:       ["gpii.tests.binder.environment"],
        markupFixture:    ".viewport-bindOnDomChange",
        binderGradeNames: ["gpii.tests.binder.bindOnDomChange.testComponent"],
        moduleName:       "Testing 'bind on dom change' support",
        components: {
            caseHolder: {
                type: "gpii.tests.binder.bindOnDomChange.caseHolder"
            }
        }
    });

    gpii.tests.binder.bindOnDomChange.environment();
})();
