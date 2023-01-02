"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const ajv = require("ajv");
const ajv_formats_1 = require("ajv-formats");
const cloneDeep = require("lodash/cloneDeep");
const forEach = require("lodash/forEach");
const groupBy = require("lodash/groupBy");
const reduce = require("lodash/reduce");
const without = require("lodash/without");
var ErrorKeyword;
(function (ErrorKeyword) {
    ErrorKeyword["additionalProperties"] = "additionalProperties";
    ErrorKeyword["anyOf"] = "anyOf";
    ErrorKeyword["enum"] = "enum";
    ErrorKeyword["oneOf"] = "oneOf";
    ErrorKeyword["pattern"] = "pattern";
    ErrorKeyword["required"] = "required";
    ErrorKeyword["type"] = "type";
    ErrorKeyword["uniqueItems"] = "uniqueItems";
})(ErrorKeyword || (ErrorKeyword = {}));
const generateError = (type, action) => {
    return (error, errors) => {
        if (error.keyword !== type) {
            return null;
        }
        const property = error.instancePath.substr(1);
        return action(error, property, errors);
    };
};
const generateRequiredError = generateError(ErrorKeyword.required, (error, property) => {
    return `'${property ? property : 'root'}' ${error.message}`;
});
const generateAdditionalPropertiesError = generateError(ErrorKeyword.additionalProperties, (error, property) => {
    const additionalProperty = error.params.additionalProperty;
    return `'${property ? property : 'root'}' ${property ? error.message : `${error.message}`}. Additional property found '${additionalProperty}'.`;
});
const generateEnumError = generateError(ErrorKeyword.enum, (error, property) => {
    const allowedValues = error.params.allowedValues;
    return `'${property}' ${error.message} '${allowedValues.join(', ')}'. Value found '${error.data}'`;
});
const generatePatternError = generateError(ErrorKeyword.pattern, (error, property) => {
    return `'${property}' ${error.message && error.message.replace(/"/g, '\'')}. Value found '${error.data}'`;
});
const generateTypeError = generateError(ErrorKeyword.type, (error, property) => {
    return `'${property}' must be '${error.params.type}'.`;
});
const generateAnyOfError = generateError(ErrorKeyword.anyOf, (error, property, errors) => {
    const otherErrors = without(errors, error);
    const results = otherErrors.map((otherError) => {
        return generate(otherError);
    });
    return results.join(' or ');
});
const generateUniqueItemError = generateError(ErrorKeyword.uniqueItems, (error, property) => {
    return `'${property}' ${error.message && error.message.replace(/"/g, '\'')}.`;
});
const getRequiredProperty = (error) => {
    return `'${error.params.missingProperty}'`;
};
const getTypeProperty = (error) => {
    return `'${error.params.type}'`;
};
const getEnumValues = (error) => {
    return `'${error.params.allowedValues.join(', ')}'`;
};
const generateAnyOfMessageRequired = (errors) => {
    return `must have required ${errors.length === 1 ? 'property' : 'properties'} ${errors.map(getRequiredProperty).join(' or ')}`;
};
const generateAnyOfMessageType = (errors) => {
    return `must be ${errors.map(getTypeProperty).join(' or ')}.`;
};
const generateAnyOfMessageEnum = (errors) => {
    return `must be equal to one of the allowed values ${errors.map(getEnumValues).join(' or ')}. Value found '${JSON.stringify(errors[0].data)}'.`;
};
const generateAnyOfMessage = {
    [ErrorKeyword.required]: generateAnyOfMessageRequired,
    [ErrorKeyword.type]: generateAnyOfMessageType,
    [ErrorKeyword.enum]: generateAnyOfMessageEnum
};
const errorGenerators = [generateAdditionalPropertiesError, generateEnumError, generatePatternError, generateTypeError, generateUniqueItemError, generateRequiredError, generateAnyOfError];
const generate = (error, errors) => {
    return errorGenerators.reduce((message, generator) => {
        const newErrorMessage = generator(error, errors);
        if (newErrorMessage) {
            return newErrorMessage;
        }
        return message;
    }, error.message || '');
};
const generateAnyOfGroupedError = (error, errors) => {
    const otherErrors = without(errors, error);
    const grouped = groupBy(otherErrors, 'keyword');
    const results = reduce(grouped, (allMessages, groupedErrors, keyword) => {
        const instancePath = error.instancePath;
        const messageGenerator = generateAnyOfMessage[keyword];
        if (messageGenerator) {
            allMessages.push(`'${instancePath ? instancePath.substr(1) : 'root'}' ${messageGenerator(groupedErrors)}`);
            return allMessages;
        }
        groupedErrors.forEach((error) => {
            const errorGenerated = generate(error, groupedErrors) || '';
            if (errorGenerated) {
                allMessages.push(`${errorGenerated}`);
            }
        });
        return allMessages;
    }, []);
    return results.join(' Or ');
};
const generateErrorsMessage = (errors) => {
    const grouped = groupBy(errors, 'keyword');
    const result = reduce(grouped, (allMessages, groupedErrors, keyword) => {
        if (keyword === ErrorKeyword.required) {
            const instancePath = groupedErrors[0].instancePath;
            allMessages.push(`'${instancePath ? instancePath.substr(1) : 'root'}' must have required ${groupedErrors.length === 1 ? 'property' : 'properties'} ${groupedErrors.map(getRequiredProperty).join(' and ')}`);
            return allMessages;
        }
        groupedErrors.forEach((error) => {
            allMessages.push(generate(error, groupedErrors) || '');
        });
        return allMessages;
    }, []);
    return result;
};
const groupMessages = (errors) => {
    const grouped = groupBy(errors, 'instancePath');
    const result = reduce(grouped, (allErrors, groupErrors) => {
        let errors = groupErrors;
        const anyOf = groupErrors.find((error) => {
            return error.keyword === ErrorKeyword.anyOf || error.keyword === ErrorKeyword.oneOf;
        });
        if (anyOf) {
            const anyOfErrors = groupErrors.filter((error) => {
                return error.schemaPath.includes(anyOf.schemaPath) || anyOf.schema.some((schema) => {
                    return error.schemaPath.includes(schema.$ref);
                });
            });
            errors = without(groupErrors, ...anyOfErrors);
            allErrors.push({
                errors: anyOfErrors,
                location: anyOfErrors[0].location,
                message: generateAnyOfGroupedError(anyOf, anyOfErrors)
            });
            if (errors.length === 0) {
                return allErrors;
            }
        }
        const groupedByLocation = groupBy(errors, (error) => {
            if (error.location) {
                return `column${error.location.column}row${error.location.column}`;
            }
            return '-';
        });
        forEach(groupedByLocation, (group) => {
            allErrors.push({
                errors: group,
                location: group[0].location,
                message: generateErrorsMessage(group).join(' and ')
            });
        });
        return allErrors;
    }, []);
    return result;
};
const errorWithLocation = (error, getLocation) => {
    let path = error.instancePath;
    const additionalProperty = error.params && error.params.additionalProperty;
    if (additionalProperty) {
        path = path ? `${path}.${additionalProperty}` : additionalProperty;
    }
    return Object.assign(Object.assign({}, error), { location: getLocation(path.replace(/'/g, '')) || undefined });
};
const prettify = (errors) => {
    const grouped = groupBy(errors, 'instancePath');
    const result = reduce(grouped, (allMessages, groupErrors) => {
        groupErrors.forEach((error) => {
            allMessages.push(generate(error, groupErrors) || '');
        });
        return allMessages;
    }, []);
    return result;
};
const validate = (schema, json, getLocation) => {
    const validator = new ajv.default({
        $data: true,
        allErrors: true,
        logger: false,
        useDefaults: true,
        verbose: true
    });
    (0, ajv_formats_1.default)(validator);
    validator.addKeyword('regexp');
    validator.addKeyword('markdownDescription');
    const data = cloneDeep(json);
    const validateFunction = validator.compile(schema);
    const valid = validateFunction(data);
    let errors = validateFunction.errors || [];
    if (errors && getLocation) {
        errors = errors.map((e) => {
            return errorWithLocation(e, getLocation);
        });
    }
    const prettifiedErrors = prettify(errors);
    const groupedErrors = groupMessages(errors);
    return {
        data,
        errors,
        groupedErrors,
        prettifiedErrors,
        valid
    };
};
exports.validate = validate;
