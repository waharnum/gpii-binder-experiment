fluid.defaults("gpii.binder.declarativeTemplateBinder", {
    gradeNames: ["gpii.binder.bindOnDomChange", "fluid.viewComponent"],
    events: {
        onTemplatesReady: null
    },
    listeners: {
        "onTemplatesReady.appendBindingTemplate": {
            "this": "{that}.container",
            "method": "append",
            args: ["{templateLoader}.resources.bindingTemplate.resourceText"]
        },

        "onTemplatesReady.generateSelectorsFromTemplate": {
            funcName: "gpii.binder.declarativeTemplateBinder.generateSelectorsFromTemplate",
            args: ["{that}", "{templateLoader}.resources.bindingTemplate.resourceText"],
            priority: "after:appendBindingTemplate"
        },
        "onTemplatesReady.generateBindingsFromTemplate": {
            funcName: "gpii.binder.declarativeTemplateBinder.generateBindingsFromTemplate",
            args: ["{that}", "{templateLoader}.resources.bindingTemplate.resourceText"],
            priority: "after:generateSelectorsFromTemplate"
        },
        "onTemplatesReady.generateVisibilityHandlersFromTemplate": {
            funcName: "gpii.binder.declarativeTemplateBinder.generateVisibilityHandlersFromTemplate",
            args: ["{that}", "{templateLoader}.resources.bindingTemplate.resourceText"],
            priority: "after:generateBindingsFromTemplate"
        },
        "onTemplatesReady.applyBinding": {
            "funcName": "gpii.binder.applyBinding",
            "args":     "{that}",
            priority: "after:generateBindingsFromTemplate"
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
            funcName: "gpii.binder.conditionalBooleanApplier",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3"]
        }
    }
});

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

gpii.binder.conditionalBooleanApplier = function (that, path, left, operator, right) {
    // console.log(that.applier);
    that.applier.change(path, gpii.binder.declarativeTemplateBinder.compare (left, operator, right));
};

// Parses an HTML template for selector-generation directives in this attribute style:
// data-fluidSelector="[selectorName]:[jQuerySelector]
// generates a selector option for each directive and re-inits the dom binder
gpii.binder.declarativeTemplateBinder.generateSelectorsFromTemplate = function (that, template) {
    var templateSelectors = gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes(template, "data-fluidSelector");
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
    var visibleIfDeclarations = gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes(template, "data-visibleIf");
    var visibleUnlessDeclarations = gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes(template, "data-visibleUnless");

    fluid.each(visibleIfDeclarations, function (declaration) {
        that.applier.modelChanged.addListener(declaration, "gpii.binder.declarativeTemplateBinder.showIf");
    });
    fluid.each(visibleUnlessDeclarations, function (declaration) {
        that.applier.modelChanged.addListener(declaration, "gpii.binder.declarativeTemplateBinder.showUnless");
    });
};

gpii.binder.declarativeTemplateBinder.operateOnElementByAttributeChangePath = function (value, oldValue, pathSegs, attributeToMatch, trueOperation, falseOperation) {
    var changePath = pathSegs.join(".");
    var matchedElements = $("[" + attributeToMatch + "='"+ changePath + "']");
    value ? matchedElements[trueOperation]() : matchedElements[falseOperation]();
};

gpii.binder.declarativeTemplateBinder.showIf = function (value, oldValue, pathSegs) {
    gpii.binder.declarativeTemplateBinder.operateOnElementByAttributeChangePath(value, oldValue, pathSegs, "data-visibleIf", "show", "hide");
};

gpii.binder.declarativeTemplateBinder.showUnless = function (value, oldValue, pathSegs) {
    gpii.binder.declarativeTemplateBinder.operateOnElementByAttributeChangePath(value, oldValue, pathSegs, "data-visibleUnless", "hide", "show");
};

// Parses an HTML template for binding-generation directives in this attribute style:
// data-gpiiBinder="[selectorName]:[modelPath]/[bindingRuleKey]"
// generates a binding option for each directive, and an optional binding rule
gpii.binder.declarativeTemplateBinder.generateBindingsFromTemplate = function(that, template) {

    var templateBindings = gpii.binder.declarativeTemplateBinder.getDirectivesFromElementAttributes(template, "data-gpiiBinder");

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
