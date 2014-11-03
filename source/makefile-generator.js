
// sea-strap.js - A "build anywhere" C/C++ makefile/project generator.
// Written in 2014 by Jesper Oskarsson jesosk@gmail.com
//
// To the extent possible under law, the author(s) have dedicated all copyright
// and related and neighboring rights to this software to the public domain worldwide.
// This software is distributed without any warranty.
//
// You should have received a copy of the CC0 Public Domain Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

var executableNameFromSourceFile = function (sourceFile) {
    var matchedName = sourceFile.match(/([^\/]+)\.\w+$/);
    if (matchedName === null) {
        throw new Error('given_source_file_without_extension');
    }
    return matchedName[1];
};

var standardFlags = {
    freebsd: "-lm"
};

var hostsPerCompiler = {
    clang: [
        'darwin',
        'darwin-clang',
        'linux-clang',
        'freebsd'
    ],
    gcc: [
        'linux',
        'linux-gcc'
    ]
};

var compilerByHost = function (host) {
    if (host !== undefined) {
        var compilerFound;
        for (var compiler in hostsPerCompiler) {
            var hosts = hostsPerCompiler[compiler];
            hosts.forEach(function (hostInList) {
                if (hostInList === host) {
                    compilerFound = compiler;
                }
            });
        }
        return compilerFound;
    
    } else {
        return 'gcc';
    }
};

var isHostValid = function(host) {
    for (var compiler in hostsPerCompiler) {
        if (hostsPerCompiler[compiler].indexOf(host) != -1) {
            return true;
        }
    }
    
    return false;
};

exports.generate = function (config) {
    var compiler = compilerByHost(config.host);
    if (config.host !== undefined && !isHostValid(config.host)) {
        throw new Error('invalid_host');
    }

    if (config.files === undefined || config.files.length === 0) {
        throw new Error('no_source_files');
    }

    var sourceFiles = config.files.join(' ');
    var executableName = config.outputName || executableNameFromSourceFile(config.files[0]);

    var extraFlags = '';
    if (config.includePaths) {
        extraFlags += ' -I' + config.includePaths.join(' -I');
    }
    if (standardFlags[config.host]) {
        extraFlags += ' ' + standardFlags[config.host];
    }

    var makefile =
        'all:\n' + 
        '\t' + compiler + ' ' + sourceFiles + extraFlags + ' -o ' + executableName + '\n';

    return makefile;
};
