fluid.defaults("gpii.binder.declarativeTemplateBinder", {
    gradeNames: ["gpii.binder.bindOnDomChange", "fluid.viewComponent"],
    events: {
        onTemplatesReady: null,
        onTemplateChanged: null
    },
    members: {
        currentTemplate: ""
    },
    model: {
        generatedListenerBooleans: {}
    },
    listeners: {
        "onTemplatesReady.setInitialTemplate": {
            funcName: "gpii.binder.declarativeTemplateBinder.setInitialTemplate",
            args: ["{that}"],
            priority: "first"
        },
        "onTemplateChanged.appendBindingTemplate": {
            "this": "{that}.container",
            "method": "html",
            args: ["{that}.currentTemplate"]
        },

        "onTemplateChanged.generateSelectorsFromTemplate": {
            funcName: "gpii.binder.declarativeTemplateBinder.generateSelectorsFromTemplate",
            args: ["{that}", "{that}.currentTemplate"],
            priority: "after:appendBindingTemplate"
        },
        "onTemplateChanged.generateBindingsFromTemplate": {
            funcName: "gpii.binder.declarativeTemplateBinder.generateBindingsFromTemplate",
            args: ["{that}", "{that}.currentTemplate"],
            priority: "after:generateSelectorsFromTemplate"
        },
        "onTemplateChanged.applyBinding": {
            "funcName": "gpii.binder.applyBinding",
            "args":     "{that}",
            priority: "after:generateBindingsFromTemplate"
        },
        "onTemplateChanged.generateVisibilityHandlersFromTemplate": {
            funcName: "gpii.binder.declarativeTemplateBinder.generateVisibilityHandlersFromTemplate",
            args: ["{that}", "{that}.currentTemplate"],
            priority: "after:applyBinding"
        },
        "onTemplateChanged.generateDOMEventListenersFromTemplate": {
            funcName: "gpii.binder.declarativeTemplateBinder.generateDOMEventListenersFromTemplate",
            args: ["{that}", "{that}.currentTemplate"],
            priority: "after:generateVisibilityHandlersFromTemplate"
        }
    },
    components: {
        templateLoader: {
            type: "fluid.resourceLoader",
            options: {
                resources: {
                    // must be supplied by implementing grade, ex:
                    // bindingTemplate: "/src/html/template.html"
                },
                listeners: {
                    "onResourcesLoaded.escalate": "{gpii.binder.declarativeTemplateBinder}.events.onTemplatesReady"
                }
            }
        },
    },
    // Define simple one-to-one transform rulesets such as string -> number for use in the declarative binding templates
    bindingRuleSets: {
        // "domToModel": "modelToDom"
        "stringToNumber": "fluid.transforms.stringToNumber:fluid.transforms.numberToString"
    },
    invokers: {
        conditionalBooleanApplier: {
            funcName: "gpii.binder.declarativeTemplateBinder.conditionalBooleanApplier",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
        },
        replaceTemplate: {
            funcName: "gpii.binder.declarativeTemplateBinder.replaceTemplate",
            args: ["{that}", "{arguments}.0"]
        }
    }
});

gpii.binder.declarativeTemplateBinder.setInitialTemplate = function (that) {
    var initialTemplate = that.templateLoader.resources.bindingTemplate.resourceText;
    that.currentTemplate = initialTemplate;
    that.events.onTemplateChanged.fire();
};

// Replace the current template and redo all the bindings, while
// retaining the model
// expects a templateName that resolves to a key in templateLoader.resources
gpii.binder.declarativeTemplateBinder.replaceTemplate = function (that, templateName) {
    console.log("replaceTemplate")
    // Delete any generated listener booleans
    that.applier.change("generatedListenerBooleans", {}, "DELETE");

    // Clear selectors
    that.options.selectors = {};

    var replacement = that.templateLoader.resources[templateName].resourceText;
    that.currentTemplate = replacement;
    that.events.onTemplateChanged.fire();
};

// Works with conditionalBooleanApplier to return true or false value based
// on three-argument tests, i.e. "{change}.value", ">=", 95
gpii.binder.declarativeTemplateBinder.compare = function (left, operator, right) {
    switch (operator) {
        case '>':   return left > right;
        case '<':   return left < right;
        case '>=':  return left >= right;
        case '<=':  return left <= right;
        case '==':  return left == right;
        case '!=':  return left != right;
        case '===': return left === right;
        case '!==': return left !== right;
    }
};

gpii.binder.declarativeTemplateBinder.conditionalBooleanApplier = function (that, path, left, operator, right) {
    that.applier.change(path, gpii.binder.declarativeTemplateBinder.compare (left, operator, right));
};

// Parses an HTML template for selector-generation directives in this attribute style:
// data-valerianSelector="[selectorName]:[jQuerySelector]
// generates a selector option for each directive and re-inits the dom binder
gpii.binder.declarativeTemplateBinder.generateSelectorsFromTemplate = function (that, template) {
    var templateSelectors = gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes(template, "data-valerianSelector");
    fluid.each(templateSelectors, function (templateSelector) {
        var selectorBlock = gpii.binder.declarativeTemplateBinder.getSelectorBlock(templateSelector);
        var selectorOptions = fluid.copy(that.options.selectors);
        $.extend(selectorOptions, selectorBlock);
        that.options.selectors = selectorOptions;
    });
    // Re-init the dombinder after setting generated selectors
    fluid.initDomBinder(that, that.options.selectors);
};

// Implements hide/show functionality based on model boolean values
gpii.binder.declarativeTemplateBinder.generateVisibilityHandlersFromTemplate = function(that, template) {
    var visibleIfDeclarations = gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes(template, "data-valerianVisibleIf");

    fluid.each(visibleIfDeclarations, function (declaration) {
        // Complex case
        if(declaration.split(" ").length > 1) {
            gpii.binder.declarativeTemplateBinder.generateListenerForComplexCase(that, declaration, "data-valerianVisibleIf");
        } else {
            var initialBooleanValue = fluid.get(that.model, declaration);
            that.applier.modelChanged.addListener(declaration, "gpii.binder.declarativeTemplateBinder.showIf");

            // Trigger change to initial state (this needs a better implementation)
            that.applier.change(declaration, "");
            that.applier.change(declaration, initialBooleanValue);
        }
    });
};

gpii.binder.declarativeTemplateBinder.generateListenerForComplexCase = function (that, complexCase, dataAttributeMatch) {
    var left = complexCase.split(" ")[0];
    var operator = complexCase.split(" ")[1];
    var right = complexCase.split(" ")[2];
    var currentValueForComparison = fluid.get(that.model, left);
    var initialBooleanValue = gpii.binder.declarativeTemplateBinder.compare(currentValueForComparison, operator, right);

    // Use complex case name as path for the generated listener boolean
    var generatedListenerBooleanPath = "generatedListenerBooleans." + complexCase;

    // Create the listener that updates the generated listener boolean when the watched value changes
    that.applier.modelChanged.addListener(left, function(){
        gpii.binder.declarativeTemplateBinder.conditionalBooleanApplier(that, generatedListenerBooleanPath, arguments[0], operator, right);
    });

    // Create the listener for actual toggle
    that.applier.modelChanged.addListener(generatedListenerBooleanPath, function() {
        gpii.binder.declarativeTemplateBinder.operateOnElementByAttributeChangePath(arguments[0], arguments[1], arguments[2], dataAttributeMatch, "show", "hide");
    });

    // Apply the change now so the listeners will pick it up
    that.applier.change(generatedListenerBooleanPath, initialBooleanValue);
};

gpii.binder.declarativeTemplateBinder.operateOnElementByAttributeChangePath = function (value, oldValue, pathSegs, attributeToMatch, trueOperation, falseOperation) {
    var pathToMatch = pathSegs[0] === "generatedListenerBooleans" ? pathSegs.slice(1).join(".") : pathSegs.join(".");
    var changePath = pathToMatch;
    var matchedElements = $("[" + attributeToMatch + "='"+ changePath + "']");
    value ? matchedElements[trueOperation]() : matchedElements[falseOperation]();
};

gpii.binder.declarativeTemplateBinder.showIf = function (value, oldValue, pathSegs) {
    gpii.binder.declarativeTemplateBinder.operateOnElementByAttributeChangePath(value, oldValue, pathSegs, "data-valerianVisibleIf", "show", "hide");
};

// Parses an HTML template for dom event listener directives in this attribute style:
// data-valerianDOMEventBinder="[selectorName]:[event]:[0-arg invoker]"
// generates an event listener as appropriate

gpii.binder.declarativeTemplateBinder.generateDOMEventListenersFromTemplate = function(that, template) {
    var eventListenerDeclarations = gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes(template, "data-valerianDOMEventBinder");

    fluid.each(eventListenerDeclarations, function (declaration) {
        var selector, eventType, invoker;

        selector = declaration.split(":")[0];
        eventType = declaration.split(":")[1];
        invoker = declaration.split(":")[2];

        var element = that.locate(selector);
        element[eventType](function (e) {
            that[invoker]();
            e.preventDefault();
        });

    });
};

// Parses an HTML template for binding-generation directives in this attribute style:
// data-valerianBinder="[selectorName]:[modelPath]/[bindingRuleKey]"
// generates a binding option for each directive, and an optional binding rule
gpii.binder.declarativeTemplateBinder.generateBindingsFromTemplate = function(that, template) {

    var templateBindings = gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes(template, "data-valerianBinder");

    fluid.each(templateBindings, function (templateBinding) {
        var selector, modelPath, bindingRule;
        var selectorAndModelPath = templateBinding.split("/")[0];
        bindingRule = templateBinding.split("/")[1];
        selector = selectorAndModelPath.split(":")[0];
        modelPath = selectorAndModelPath.split(":")[1];

        var bindingKey = "templateBinding" + fluid.allocateGuid();

        var bindingEntry = {};

        fluid.set(bindingEntry, bindingKey, {});

        fluid.set(bindingEntry[bindingKey], "selector", selector);
        fluid.set(bindingEntry[bindingKey], "path", modelPath);

        if(bindingRule) {
            var ruleDefString;
            // Binding rule shorthand case
            if(bindingRule.indexOf(":") < 0) {
                ruleDefString = fluid.get(that.options.bindingRuleSets, bindingRule);
            // Longhand case
            } else {
                ruleDefString = bindingRule;
            }
            var ruleObj = gpii.binder.declarativeTemplateBinder.getRuleBlock(ruleDefString);
            fluid.set(bindingEntry[bindingKey], "rules", ruleObj);
        }

        var bindingOptions = fluid.copy(that.options.bindings);
        $.extend(bindingOptions, bindingEntry);
        that.options.bindings = bindingOptions;
    });
};

gpii.binder.declarativeTemplateBinder.getSelectorBlock = function (selectorDefString) {
    var selectorKey = selectorDefString.split(":")[0];
    var selectorValue = selectorDefString.split(":")[1];
    var selectorBlock = {};
    fluid.set(selectorBlock, selectorKey, selectorValue);
    return selectorBlock;
};

gpii.binder.declarativeTemplateBinder.getRuleBlock = function (ruleDefString) {
    var domToModelTransformType = ruleDefString.split(":")[0];
    var modelToDomTransformType = ruleDefString.split(":")[1];
    var ruleBlock = {
        domToModel: {
            "": {
                transform: {
                    type: domToModelTransformType,
                    inputPath: ""
                }
            }
        },
        modelToDom: {
            "": {
                transform: {
                    type: modelToDomTransformType,
                    inputPath: ""
                }
            }
        }
    };

    return ruleBlock;
};

gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes = function (template, attributeName) {
    var elementsWithAttribute = $('*[' + attributeName + ']');
    var attributeValues = fluid.transform(elementsWithAttribute, function (element) {
        return $(element).attr(attributeName);
    });
    var uniqueElements = [];
    fluid.each(attributeValues, function (attributeValue) {
        if(! fluid.contains(uniqueElements, attributeValue)) {
            uniqueElements.push(attributeValue);
        }
    });
    return uniqueElements;

};
