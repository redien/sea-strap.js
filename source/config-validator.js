
// limbus-buildgen - A "build anywhere" C/C++ makefile/project generator.
// Written in 2014-2016 by Jesper Oskarsson jesosk@gmail.com
//
// To the extent possible under law, the author(s) have dedicated all copyright
// and related and neighboring rights to this software to the public domain worldwide.
// This software is distributed without any warranty.
//
// You should have received a copy of the CC0 Public Domain Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

var requiredProjectProperties = [
    'title',
    'toolchain',
    'artifacts'
];

var optionalProjectProperties = [];

var requiredProperties = [
    'title',
    'type',
    'files',
    'outputName'
];

var optionalProperties = [
    'outputPath',
    'compilerFlags',
    'linkerFlags',
    'includePaths',
    'libraryPaths',
    'libraries'
];

var validTypes = [
    'application',
    'dynamic-library',
    'static-library'
];

var validToolchains = [
    'linux',
    'linux-make-clang-linux-x86',
    'linux-make-clang-linux-x64',
    'linux-make-gcc-linux-x86',
    'linux-make-gcc-linux-x64',
    'darwin',
    'darwin-make-clang-darwin-x86',
    'darwin-make-clang-darwin-x64',
    'darwin-make-gcc-darwin-x86',
    'darwin-make-gcc-darwin-x64',
    'win32',
    'win32-make-cl-win32-x86',
    'win32-make-cl-win32-x64',
    'freebsd',
    'freebsd-make-clang-freebsd-x86',
    'freebsd-make-clang-freebsd-x64',
    'freebsd-make-gcc-freebsd-x64'
];

var stringProjectProperties = [
    'title'
];

var stringProperties = [
    'title',
    'outputName',
    'outputPath',
    'compilerFlags',
    'linkerFlags'
];

var stringArrayProperties = [
    'files',
    'includePaths',
    'libraryPaths',
    'libraries'
];

var validResult = function () {
    return { valid: true };
};
var errorResult = function (error, property) {
    return {
        valid: false,
        error: error,
        property: property
    };
};

var ConfigValidator = {};

var dash = require('./publicdash');

var returnErrorOn = function (properties, error, predicate) {
    return dash.reduce(properties, function (result, property) {
        if (predicate(property)) {
            return errorResult(error, property);
        } else {
            return result;
        }
    }, validResult());
};

var isValidValue = function (validValues, value) {
    return validValues.indexOf(value) !== -1;
};

var validateForInvalidProjectValues = function (config) {
    if (!isValidValue(validToolchains, config.toolchain)) {
        return errorResult('invalid project property', 'toolchain');
    }

    return validResult();
};

var validateRequiredProperties = function (config) {
    return returnErrorOn(requiredProperties, 'missing required property', function (property) {
        return config[property] === undefined;
    });
};

var validateRequiredProjectProperties = function (config) {
    return returnErrorOn(requiredProjectProperties, 'missing required project property', function (property) {
        return config[property] === undefined;
    });
};

var validateStringProperties = function (config) {
    return returnErrorOn(stringProperties, 'property is not a string', function (property) {
        return config[property] !== undefined && typeof config[property] !== 'string';
    });
};

var validateStringProjectProperties = function (config) {
    return returnErrorOn(stringProjectProperties, 'project property is not a string', function (property) {
        return config[property] !== undefined && typeof config[property] !== 'string';
    });
};

var arrayContainsNonString = function (array) {
    for (var index = 0; index < array.length; index += 1) {
        var value = array[index];
        if (typeof value !== 'string') {
            return true;
        }
    }
    return false;
};

var validateStringArrayProperties = function (config) {
    return returnErrorOn(stringArrayProperties, 'property is not a string array', function (property) {
        return config[property] !== undefined &&
            (!Array.isArray(config[property]) || arrayContainsNonString(config[property]));
    });
};

var validateFilenames = function (config) {
    return returnErrorOn(['outputName'], 'cannot be path', function (property) {
        return config[property].match(/[\/\\]/) !== null ||
            config[property] === '.' ||
            config[property] === '..';
    });
};

var validateFileArrays = function (config) {
    return returnErrorOn(['files'], 'no input files', function (property) {
        return config[property].length === 0;
    });
};

var validateUnknownProperties = function (requiredProperties, optionalProperties, error) {
    return function (config) {
        for (var property in config) {
            if (config.hasOwnProperty(property)) {
                if (requiredProperties.indexOf(property) === -1 &&
                    optionalProperties.indexOf(property) === -1) {
                    return errorResult(error, property);
                }
            }
        }

        return validResult();
    };
};

var validateForInvalidValues = function (config) {
    if (!isValidValue(validTypes, config.type)) {
        return errorResult('invalid property', 'type');
    }

    return validResult();
};

var validateFileExtensions = function (config) {
    return dash.reduce(config.files, function (result, file) {
        if (result.valid && file.match(/\.\w/) === null) {
            return errorResult('no extension', 'files');
        }
        return result;
    }, validResult());
};

var validateMiscConstraints = function (config) {
    if (config.type === 'static-library' && (config.libraries !== undefined && config.libraries.length > 0)) {
        return errorResult('given libraries with static-library', 'libraries');
    }

    return validResult();
};

ConfigValidator.validate = function (config) {
    var validators = [
        validateUnknownProperties(requiredProperties, optionalProperties, 'unknown property'),
        validateRequiredProperties,
        validateForInvalidValues,
        validateStringProperties,
        validateStringArrayProperties,
        validateFileExtensions,
        validateFilenames,
        validateFileArrays,
        validateMiscConstraints
    ];

    var projectValidators = [
        validateUnknownProperties(requiredProjectProperties, optionalProjectProperties, 'unknown project property'),
        validateRequiredProjectProperties,
        validateForInvalidProjectValues,
        validateStringProjectProperties
    ];

    var validate = function (config, validators, startingResult) {
        return dash.reduce(validators, function (result, validator) {
            if (result.valid) {
                return validator(config);
            } else {
                return result;
            }
        }, startingResult);
    };

    var projectValidation = validate(config, projectValidators, validResult());

    return dash.reduce(config.artifacts, function (result, artifact) {
        if (result.valid) {
            return validate(artifact, validators, result);
        } else {
            return result;
        }
    }, projectValidation);
};

module.exports = ConfigValidator;
