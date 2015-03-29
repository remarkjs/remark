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
# Command.
#

COMMAND="bin/mdast"

#
# Fixtures
#

directory="test/cli"

markdown="test/cli/markdown.md"
markdownAlt="test/cli/markdown-alt.md"
plugin="test/badges.js"
rc="test/cli/rc.json"
ignore="test/cli/ignore.ini"

missing="test/cli/missing/markdown.md"
missingPlugin="test/cli/missin/plugin.js"
missingRC="test/cli/missing/rc.json"
missingIgnore="test/cli/missing/ignore.ini"

invalidRc="test/cli/invalid/rc.json"

ignoredDirectory="test/cli/ignored"
ignoredFile="test/cli/ignored-alt/markdown.md"

tmp="test/cli/tmp.md"

#
# File and stdin.
#

it "Should accept a file"
    code=0
    $COMMAND $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept stdin"
    code=0
    cat $markdown | $COMMAND > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail without input"
    code=0
    $COMMAND > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on an invalid file"
    code=0
    $COMMAND $missing > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on multiple files"
    code=0
    $COMMAND $markdown $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on stdin and files"
    code=0
    cat $markdown | $COMMAND $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--ast`.
#

it "Should accept \`--ast\`"
    code=0
    $COMMAND --ast $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`-a\`"
    code=0
    $COMMAND -a $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--quiet`.
#

it "Should accept \`--quiet\`"
    result=`$COMMAND --quiet $markdown $markdownAlt --output`
    assert 0 $?
    assert $result ""

it "Should accept \`-q\`"
    result=`$COMMAND -q $markdown $markdownAlt --output`
    assert 0 $?
    assert $result ""

#
# `--output`.
#

it "Should accept \`-o <path>\`"
    code=0
    $COMMAND -o $tmp $markdown > /dev/null 2>&1 || code=$?
    rm $tmp
    assert $code 0

it "Should accept \`--output <path>\`"
    code=0
    $COMMAND --output $tmp $markdown > /dev/null 2>&1 || code=$?
    rm $tmp
    assert $code 0

it "Should fail on \`-o <invalid-path>\`"
    code=0
    $COMMAND -o $missing $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--output <invalid-path>\`"
    code=0
    $COMMAND --output $missing $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should NOT fail on missing value for \`-o\`"
    code=0
    $COMMAND $markdown -o > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should NOT fail on missing value for \`--output\`"
    code=0
    $COMMAND $markdown --output > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on \`-o <path>\` and multiple files"
    code=0
    $COMMAND $markdown $markdownAlt -o $tmp > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--output <path>\` and multiple files"
    code=0
    $COMMAND $markdown $markdownAlt --output $tmp > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing \`-o\` and multiple files"
    code=0
    $COMMAND $markdown $markdownAlt > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing \`--output\` and multiple files"
    code=0
    $COMMAND $markdown $markdownAlt > /dev/null 2>&1 || code=$?
    assert $code 1

#
# Multiple files and directories.
#

it "Should accept a directory"
    code=0
    $COMMAND $directory -o > /dev/null 2>&1 || code=$?
    assert $code 0

    $COMMAND $directory --output > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail when given an ignored directory"
    code=0
    $COMMAND $ignoredDirectory --ignore-path $ignore > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail when given an ignored file"
    code=0
    $COMMAND $ignoredFile --ignore-path $ignore > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--use`.
#

it "Should accept \`-u <plugin>\`"
    code=0
    $COMMAND -u $plugin $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`--use <plugin>\`"
    code=0
    $COMMAND --use $plugin $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on \`-u <invalid-plugin>\`"
    code=0
    $COMMAND -u $missingPlugin $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--use <invalid-plugin>\`"
    code=0
    $COMMAND --use $missingPlugin $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`-u\`"
    code=0
    $COMMAND $markdown -u > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`--use\`"
    code=0
    $COMMAND $markdown --use > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--config-path`.
#

it "Should accept \`-c <path>\`"
    code=0
    $COMMAND -c $rc $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`--config-path <path>\`"
    code=0
    $COMMAND --config-path $rc $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on \`-c <invalid-path>\`"
    code=0
    $COMMAND -c $missingRC $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--config-path <invalid-path>\`"
    code=0
    $COMMAND --config-path $missingRC $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`-c <invalid-file>\`"
    code=0
    $COMMAND -c $invalidRc $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--config-path <invalid-file>\`"
    code=0
    $COMMAND --config-path $invalidRc $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on a missing value for \`-c\`"
    code=0
    $COMMAND $markdown -c > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on a missing value for \`--config-path\`"
    code=0
    $COMMAND $markdown --config-path > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--ignore-path`.
#

it "Should accept \`-i <path>\`"
    code=0
    $COMMAND -i $ignore $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`--ignore-path <path>\`"
    code=0
    $COMMAND --ignore-path $ignore $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on \`-i <invalid-path>\`"
    code=0
    $COMMAND -i $missingIgnore $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--ignore-path <invalid-path>\`"
    code=0
    $COMMAND --ignore-path $missingIgnore $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on a missing value for \`-i\`"
    code=0
    $COMMAND $markdown -i > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on a missing value for \`--ignore-path\`"
    code=0
    $COMMAND $markdown --ignore-path > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--setting`.
#

it "Should accept \`-s <settings>\`"
    code=0
    $COMMAND -s yaml:false $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`--setting <settings>\`"
    code=0
    $COMMAND --setting yaml:false $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on \`-s <invalid-settings>\`"
    code=0
    $COMMAND -s yaml:1 $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on \`--setting <invalid-settings>\`"
    code=0
    $COMMAND --setting yaml:1 $markdown > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`-s\`"
    code=0
    $COMMAND $markdown -s > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`--setting\`"
    code=0
    $COMMAND $markdown --setting > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--ext`.
#

it "Should accept \`-e <extensions>\`"
    code=0
    $COMMAND -e .ngdoc $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`--ext <extensions>\`"
    code=0
    $COMMAND --ext .ngdoc $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should fail on missing value for \`-e\`"
    code=0
    $COMMAND $markdown -e > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on missing value for \`--ext\`"
    code=0
    $COMMAND $markdown --ext > /dev/null 2>&1 || code=$?
    assert $code 1

#
# `--no-rc`.
#

it "Should accept \`--no-rc\`"
    code=0
    $COMMAND --no-rc $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--no-ignore`.
#

it "Should accept \`--no-ignore\`"
    code=0
    $COMMAND --no-ignore $markdown > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--help`.
#

it "Should accept \`--help\`"
    code=0
    $COMMAND --help > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`-h\`"
    code=0
    $COMMAND -h > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--version`.
#

it "Should accept \`--version\`"
    code=0
    $COMMAND --version > /dev/null 2>&1 || code=$?
    assert $code 0

it "Should accept \`-V\`"
    code=0
    $COMMAND -V > /dev/null 2>&1 || code=$?
    assert $code 0

#
# `--`
#

it "Should stop parsing arguments after \`--\`"
    code=0
    $COMMAND $markdown -- $missing > /dev/null 2>&1 || code=$?
    assert $code 0

#
# Unknown flags.
#

it "Should fail on unknown short options"
    code=0
    $COMMAND -v > /dev/null 2>&1 || code=$?
    assert $code 1

it "Should fail on unknown long options"
    code=0
    $COMMAND --verbose > /dev/null 2>&1 || code=$?
    assert $code 1

printf "\033[32m\n(✓) Passed $tests assertions without errors\033[0m\n";
