
// limbus-buildgen - A "build anywhere" C/C++ makefile/project generator.
// Written in 2014 by Jesper Oskarsson jesosk@gmail.com
//
// To the extent possible under law, the author(s) have dedicated all copyright
// and related and neighboring rights to this software to the public domain worldwide.
// This software is distributed without any warranty.
//
// You should have received a copy of the CC0 Public Domain Dedication along with this software.
// If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.

var should = require('should');
var fs = require('fs');
var util = require('./util.js');

var setup = function () {
    /* Includes and linking */
    fs.writeFileSync(
        "temp/linked.c",

         "#include <mylibrary.h>\n"
        +"#include <stdio.h>\n"
        +"int main(int argc, char** argv) {\n"
        +"  printf(\"%d\", add(23, 88) - 69);\n"
        +"  return (add(23, 88) == 111) ? 0 : -1;\n"
        +"}\n");

    fs.writeFileSync(
        "temp/source/mylibrary.c",

         "#include \"../include/mylibrary.h\"\n"
        +"int add(int a, int b) {\n"
        +"  return a + b;\n"
        +"}\n");

    fs.writeFileSync(
        "temp/include/mylibrary.h",

        "int add(int a, int b);\n");

    /* Check for libm */
    fs.writeFileSync(
        "temp/math.c",

         "#include <math.h>\n"
        +"#include <stdio.h>\n"
        +"int main(int argc, char** argv) {\n"
        +"  printf(\"%g\", ceil(0.5f) + 41.0f);\n"
        +"  return ceil(0.5f) - 1;\n"
        +"}\n");
    
    fs.writeFileSync(
        "temp/simple.c",

         "int main(int argc, char** argv) {\n"
        +"  printf(\"%d\", 42);\n"
        +"  return 0;\n"
        +"}\n");
};

describe('Linking', function () {
    it('should compile and link correctly given several source files and includes', function (done) {
        util.generateCompileAndRun({
            setup: setup,
            config: {
                files: [
                    'linked.c',
                    'source/mylibrary.c'
                ],
                host: process.platform,
                includePaths: [
                    'include'
                ],
                outputName: 'linked',
                type: 'application'
            },
            command: 'linked',
            expectOutputToMatch: /42/
        }, done);
    });

    it('should link with libm by default', function (done) {
        util.generateCompileAndRun({
            setup: setup,
            config: {
                files: [
                    'math.c'
                ],
                host: process.platform,
                outputName: 'math',
                type: 'application'
            },
            command: 'math',
            expectOutputToMatch: /42/
        }, done);
    });

    it('should compile to an executable with outputName', function (done) {
        util.generateCompileAndRun({
            setup: setup,
            config: {
                files: [
                    'simple.c'
                ],
                host: process.platform,
                outputName: 'my_executable',
                type: 'application'
            },
            command: 'my_executable',
            expectOutputToMatch: /42/
        }, done);
    });

    it('should compile a static library and then be able to link to it', function (done) {
        util.generateCompileAndRun({
            setup: setup,
            config: [
                {
                    files: [
                        'source/mylibrary.c'
                    ],
                    type: 'static-library',
                    host: process.platform,
                    outputName: 'my_lib_name'
                },
                {
                    files: [
                        'linked.c'
                    ],
                    libraries: [
                        'my_lib_name'
                    ],
                    includePaths: [
                        'include'
                    ],
                    host: process.platform,
                    outputName: 'linked_with_library',
                    type: 'application'
                }
            ],
            command: 'linked_with_library',
            expectOutputToMatch: /42/
        }, done);
    });
});
