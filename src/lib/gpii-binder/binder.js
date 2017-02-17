/*

    Add persistent bindings between a selector and a model value.  Changes are propagated between the two. See the
    documentation for more details:

    https://github.com/GPII/gpii-binder/

    This code was originally written by Antranig Basman <amb26@ponder.org.uk> and with his advice was updated and
    extended by Tony Atkins <tony@raisingthefloor.org>.

*/
/* global fluid, jQuery */
(function () {
    "use strict";
    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.binder");

    /**
     *
     * A function to "safely" relay DOM changes to the model.  It uses the model change applier, but deletes "null" or
     * "undefined" values.  This is required to deal with form fields whose value is set to an empty string, which
     * commonly occurs with text inputs.
     *
     * The raw values are transformed using `fluid.model.transformWithRules` and `options.rules.domToModel`.
     *
     * @param that {Object} The component itself.
     * @param path {String} The path to the model variable to be updated.
     * @param elementValue {Object} The value to set.
     */
    gpii.binder.changeModelValue = function (that, path, elementValue) {
        var transformedValue = gpii.binder.transformPathedValue(that, path, elementValue, "domToModel");
        if (transformedValue === null || transformedValue === undefined) {
            that.applier.change(path, transformedValue, "DELETE");
        }
        else {
            that.applier.change(path, transformedValue);
        }
    };

    /**
     *
     * Change the value of a DOM element based on a model values. Raw values are transformed using ``.
     *
     * @param that {Object} The component itself.
     * @param element {Object} The jQuery element itself.
     * @param path {String} The path to the model variable to be updated.
     * @param modelValue {Object} The value to set.
     *
     * */
    gpii.binder.changeElementValue = function (that, element, path, modelValue) {
        var transformedValue = gpii.binder.transformPathedValue(that, path, modelValue, "modelToDom");
        var isFormElement = gpii.binder.isFormElement(element);
        if(isFormElement) {
            fluid.value(element, transformedValue);
        } else {
            element.text(transformedValue);
        }
    };

    /**
     *
     * Transform a raw value based on the model transformation rules in its binding definition.  Note, that because
     * the model transformation system deals oddly with `undefined` values, those are implicitly converted to `null`
     * before attempting to transform them.
     *
     * @param path {String} The path to the bound model variable.  Used to look up the binding settings.
     * @param rawValue {Object} The value to be transformed.
     * @param ruleName {String} The rule to use when transforming the rule.
     * @returns The transformed value.
     *
     */
    gpii.binder.transformPathedValue = function (that, path, rawValue, ruleName) {
        var binderOptions = gpii.binder.getPathBindingOptions(that, path);
        if (binderOptions.rules && binderOptions.rules[ruleName]) {
            // `undefined` values assigned to the path "" (as we intend for people to do) results in empty objects rather
            // than `undefined` values.  We pass `null` instead, so that the underlying transformation can make the call.
            var valueToTransform = rawValue === undefined ? null : rawValue;

            var rules = binderOptions.rules[ruleName];
            return fluid.model.transformWithRules(valueToTransform, rules);
        }
        else {
            return rawValue;
        }
    };

    /**
     *
     * Retrieve the binding settings for an individual path.
     *
     * @param that {Object} The binder component itself.
     * @param desiredPath {String} The model path for the desired binding.
     * @returns {Object} The binder options for the specific path, in "long form".
     *
     */
    gpii.binder.getPathBindingOptions = function (that, desiredPath) {
        return fluid.find(that.options.bindings, function (value, key) {
            var path = typeof value === "string" ? value : value.path;
            if (path === desiredPath) {
                if (typeof value === "string") {
                    return { path: path, selector: key };
                }
                else {
                    return value;
                }
            }
        });
    };


    gpii.binder.isFormElement = function (element) {
        var elementTagName = element.prop("tagName");
        var formTagNames = ["INPUT", "SELECT", "TEXTAREA"];
        return fluid.contains(formTagNames, elementTagName);
    };

    /**
     *
     * The main function to create bindings between markup and model elements.  See above for usage details.
     *
     * @param that - A fluid viewComponent with `options.bindings` and `options.selectors` defined.
     *
     */
    gpii.binder.applyBinding = function (that) {
        fluid.each(that.options.bindings, function (value, key) {
            var path     = typeof value === "string" ? value : value.path;
            var selector = typeof value === "string" ? key : value.selector;
            var element = that.locate(selector);

            var isFormElement = gpii.binder.isFormElement(element);

            if (element.length > 0) {

                // Update the model when the form changes
                if(isFormElement) {
                    element.change(function () {
                        fluid.log("Changing model based on element update.");

                        gpii.binder.changeModelValue(that, path, fluid.value(element));
                    });
                }

                // TODO: an equivalent for non-form elements to bind
                // DOM changes to models
                // attach custom event?

                // Update the element when the model changes
                that.applier.modelChanged.addListener(path, function (changedValue) {
                    fluid.log("Changing value based on model update.");
                    gpii.binder.changeElementValue(that, element, path, changedValue);
                });

                // If we have model data initially, update the form.  Model values win out over markup.
                var initialModelValue = fluid.get(that.model, path);
                if (initialModelValue !== undefined) {
                    gpii.binder.changeElementValue(that, element, path, initialModelValue);
                }
                // If we have no model data, but there are defaults in the markup, using them to update the model.
                else {
                    gpii.binder.changeModelValue(that, path, fluid.value(element));
                }
            }
            else {
                fluid.log("Could not locate element using selector '" + element.selector + "'...");
            }
        });
    };

    fluid.defaults("gpii.binder", {
        gradeNames: ["fluid.viewComponent"],
        mergePolicy: {
            bindings: "nomerge"
        }
    });

    // A mix-in grade to apply bindings when a viewComponent is created.
    fluid.defaults("gpii.binder.bindOnCreate", {
        gradeNames: ["gpii.binder"],
        listeners: {
            "onCreate.applyBinding": {
                funcName: "gpii.binder.applyBinding",
                args:     ["{that}"]
            }
        }
    });

    fluid.defaults("gpii.binder.bindOnDomChange", {
        gradeNames: ["gpii.binder"],
        events: {
            onDomChange: null
        },
        listeners: {
            "onDomChange.applyBinding": {
                funcName: "gpii.binder.applyBinding",
                args:     ["{that}"]
            }
        }
    });
})(jQuery);
