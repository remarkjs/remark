#!/bin/sh
#!/bin/bash

typeset -i tests=0

#
# Describe.
#

function it {
    let tests+=1;
    description="$1";
}

#
# Assert.
#
# @param actual
# @param expected
#

function assert {
    if [[ "$1" == "$2" ]]; then
        printf "\033[32m.\033[0m";
    else
        printf "\033[31m\nFAIL: $description\033[0m: '$1' != '$2'\n";
        exit 1
    fi
}

#
# File and stdin.
#

it "Should accept a file"
    code=0
    ./cli.js Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept stdin"
    code=0
    cat History.md | ./cli.js > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail without input"
    code=0
    ./cli.js > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on an invalid file"
    code=0
    ./cli.js some-other-file.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on multiple files"
    code=0
    ./cli.js History.md Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on stdin and files"
    code=0
    cat History.md | ./cli.js Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--ast`.
#

it "Should accept \`--ast\`"
    code=0
    ./cli.js --ast Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`-a\`"
    code=0
    ./cli.js -a Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--output`.
#

it "Should accept \`-o <path>\`"
    code=0
    ./cli.js -o out.md Readme.md > /dev/null 2>&1 || code=$?
    rm out.md
    assert $code 0

it "Should accept \`--output <path>\`"
    code=0
    ./cli.js --output out.md Readme.md > /dev/null 2>&1 || code=$?
    rm out.md
    assert $code 0

it "Should fail on \`-o <invalid-path>\`"
    code=0
    ./cli.js -o invalid/out.md Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--output <invalid-path>\`"
    code=0
    ./cli.js --output invalid/out.md Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`-o\`"
    code=0
    ./cli.js Readme.md -o > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`--output\`"
    code=0
    ./cli.js Readme.md --output > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--use`.
#

it "Should accept \`-u <plugin>\`"
    code=0
    ./cli.js -u ./test/badges.js Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`--use <plugin>\`"
    code=0
    ./cli.js --use ./test/badges.js Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on \`-u <invalid-plugin>\`"
    code=0
    ./cli.js -u ./invalid-plugin.js Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--use <invalid-plugin>\`"
    code=0
    ./cli.js --use ./invalid-plugin.js Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`-u\`"
    code=0
    ./cli.js Readme.md -u > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`--use\`"
    code=0
    ./cli.js Readme.md --use > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--config`.
#

it "Should accept \`-c <path>\`"
    code=0
    ./cli.js -c ".mdastrc" Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`--config <path>\`"
    code=0
    ./cli.js --config ".mdastrc" Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on \`-c <invalid-path>\`"
    code=0
    ./cli.js -c "somefile.json" Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--config <invalid-path>\`"
    code=0
    ./cli.js --config "somefile.json" Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on a missing value for \`-c\`"
    code=0
    ./cli.js Readme.md -c > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on a missing value for \`--config\`"
    code=0
    ./cli.js Readme.md --config > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--setting`.
#

it "Should accept \`-s <settings>\`"
    code=0
    ./cli.js -s yaml:false Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`--setting <settings>\`"
    code=0
    ./cli.js --setting yaml:false Readme.md > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on \`-s <invalid-settings>\`"
    code=0
    ./cli.js -s yaml:1 Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--setting <invalid-settings>\`"
    code=0
    ./cli.js --setting yaml:1 Readme.md > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`-s\`"
    code=0
    ./cli.js Readme.md -s > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`--setting\`"
    code=0
    ./cli.js Readme.md --setting > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--settings`.
#

it "Should accept \`--settings\`"
    code=0
    ./cli.js --settings > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--help`.
#

it "Should accept \`--help\`"
    code=0
    ./cli.js --help > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`-h\`"
    code=0
    ./cli.js -h > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--version`.
#

it "Should accept \`--version\`"
    code=0
    ./cli.js --version > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`-V\`"
    code=0
    ./cli.js -V > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--`
#

it "Should stop parsing arguments after \`--\`"
    code=0
    ./cli.js History.md -- Some-unknown-file.md > /dev/null 2>&1 || code=$?
    assert $code 0

#
# Unknown flags.
#

it "Should fail on unknown short options"
    code=0
    ./cli.js -v > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on unknown long options"
    code=0
    ./cli.js --verbose > /dev/null 2>&1 || code=$?
    assert $code 1

printf "\033[32m\n(✓) Passed $tests assertions without errors\033[0m\n";
