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
npmPlugin="toc"
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
    $COMMAND $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept stdin"
    cat $markdown | $COMMAND > /dev/null 2>&1
    assert $? 0

it "Should fail without input"
    $COMMAND > /dev/null 2>&1
    assert $? 1

it "Should fail on an invalid file"
    $COMMAND $missing > /dev/null 2>&1
    assert $? 1

it "Should fail on multiple files"
    $COMMAND $markdown $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on stdin and files"
    cat $markdown | $COMMAND $markdown > /dev/null 2>&1
    assert $? 1

#
# `--ast`.
#

it "Should accept \`--ast\`"
    $COMMAND --ast $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`-a\`"
    $COMMAND -a $markdown > /dev/null 2>&1
    assert $? 0

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
    $COMMAND -o $tmp $markdown > /dev/null 2>&1
    code=$?
    rm $tmp
    assert $code 0

it "Should accept \`--output <path>\`"
    $COMMAND --output $tmp $markdown > /dev/null 2>&1
    code=$?
    rm $tmp
    assert $code 0

it "Should fail on \`-o <invalid-path>\`"
    $COMMAND -o $missing $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on \`--output <invalid-path>\`"
    $COMMAND --output $missing $markdown > /dev/null 2>&1
    assert $? 1

it "Should NOT fail on missing value for \`-o\`"
    $COMMAND $markdown -o > /dev/null 2>&1
    assert $? 0

it "Should NOT fail on missing value for \`--output\`"
    $COMMAND $markdown --output > /dev/null 2>&1
    assert $? 0

it "Should fail on \`-o <path>\` and multiple files"
    $COMMAND $markdown $markdownAlt -o $tmp > /dev/null 2>&1
    assert $? 1

it "Should fail on \`--output <path>\` and multiple files"
    $COMMAND $markdown $markdownAlt --output $tmp > /dev/null 2>&1
    assert $? 1

it "Should fail on missing \`-o\` and multiple files"
    $COMMAND $markdown $markdownAlt > /dev/null 2>&1
    assert $? 1

it "Should fail on missing \`--output\` and multiple files"
    $COMMAND $markdown $markdownAlt > /dev/null 2>&1
    assert $? 1

#
# Multiple files and directories.
#

it "Should accept a directory"
    $COMMAND $directory -o > /dev/null 2>&1
    assert $? 0

    $COMMAND $directory --output > /dev/null 2>&1
    assert $? 0

it "Should fail when given an ignored directory"
    $COMMAND $ignoredDirectory --ignore-path $ignore > /dev/null 2>&1
    assert $? 1

it "Should fail when given an ignored file"
    $COMMAND $ignoredFile --ignore-path $ignore > /dev/null 2>&1
    assert $? 1

#
# `--use`.
#

it "Should accept \`-u <plugin>\`"
    $COMMAND -u $plugin $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`--use <plugin>\`"
    $COMMAND --use $plugin $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`-u <unprefixed-npm-plugin>\`"
    $COMMAND -u $npmPlugin $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`-u <prefixed-npm-plugin>\`"
    $COMMAND -u "mdast-$npmPlugin" $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`--use <unprefixed-npm-plugin>\`"
    $COMMAND --use $npmPlugin $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`--use <prefixed-npm-plugin>\`"
    $COMMAND --use "mdast-$npmPlugin" $markdown > /dev/null 2>&1
    assert $? 0

it "Should fail on \`-u <invalid-plugin>\`"
    $COMMAND -u $missingPlugin $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on \`--use <invalid-plugin>\`"
    $COMMAND --use $missingPlugin $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on missing value for \`-u\`"
    $COMMAND $markdown -u > /dev/null 2>&1
    assert $? 1

it "Should fail on missing value for \`--use\`"
    $COMMAND $markdown --use > /dev/null 2>&1
    assert $? 1

#
# `--config-path`.
#

it "Should accept \`-c <path>\`"
    $COMMAND -c $rc $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`--config-path <path>\`"
    $COMMAND --config-path $rc $markdown > /dev/null 2>&1
    assert $? 0

it "Should fail on \`-c <invalid-path>\`"
    $COMMAND -c $missingRC $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on \`--config-path <invalid-path>\`"
    $COMMAND --config-path $missingRC $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on \`-c <invalid-file>\`"
    $COMMAND -c $invalidRc $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on \`--config-path <invalid-file>\`"
    $COMMAND --config-path $invalidRc $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on a missing value for \`-c\`"
    $COMMAND $markdown -c > /dev/null 2>&1
    assert $? 1

it "Should fail on a missing value for \`--config-path\`"
    $COMMAND $markdown --config-path > /dev/null 2>&1
    assert $? 1

#
# `--ignore-path`.
#

it "Should accept \`-i <path>\`"
    $COMMAND -i $ignore $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`--ignore-path <path>\`"
    $COMMAND --ignore-path $ignore $markdown > /dev/null 2>&1
    assert $? 0

it "Should fail on \`-i <invalid-path>\`"
    $COMMAND -i $missingIgnore $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on \`--ignore-path <invalid-path>\`"
    $COMMAND --ignore-path $missingIgnore $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on a missing value for \`-i\`"
    $COMMAND $markdown -i > /dev/null 2>&1
    assert $? 1

it "Should fail on a missing value for \`--ignore-path\`"
    $COMMAND $markdown --ignore-path > /dev/null 2>&1
    assert $? 1

#
# `--setting`.
#

it "Should accept \`-s <settings>\`"
    $COMMAND -s yaml:false $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`--setting <settings>\`"
    $COMMAND --setting yaml:false $markdown > /dev/null 2>&1
    assert $? 0

it "Should fail on \`-s <invalid-settings>\`"
    $COMMAND -s yaml:1 $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on \`--setting <invalid-settings>\`"
    $COMMAND --setting yaml:1 $markdown > /dev/null 2>&1
    assert $? 1

it "Should fail on missing value for \`-s\`"
    $COMMAND $markdown -s > /dev/null 2>&1
    assert $? 1

it "Should fail on missing value for \`--setting\`"
    $COMMAND $markdown --setting > /dev/null 2>&1
    assert $? 1

#
# `--ext`.
#

it "Should accept \`-e <extensions>\`"
    $COMMAND -e .ngdoc $markdown > /dev/null 2>&1
    assert $? 0

it "Should accept \`--ext <extensions>\`"
    $COMMAND --ext .ngdoc $markdown > /dev/null 2>&1
    assert $? 0

it "Should fail on missing value for \`-e\`"
    $COMMAND $markdown -e > /dev/null 2>&1
    assert $? 1

it "Should fail on missing value for \`--ext\`"
    $COMMAND $markdown --ext > /dev/null 2>&1
    assert $? 1

#
# `--no-rc`.
#

it "Should accept \`--no-rc\`"
    $COMMAND --no-rc $markdown > /dev/null 2>&1
    assert $? 0

#
# `--no-ignore`.
#

it "Should accept \`--no-ignore\`"
    $COMMAND --no-ignore $markdown > /dev/null 2>&1
    assert $? 0

#
# `--help`.
#

it "Should accept \`--help\`"
    $COMMAND --help > /dev/null 2>&1
    assert $? 0

it "Should accept \`-h\`"
    $COMMAND -h > /dev/null 2>&1
    assert $? 0

#
# `--version`.
#

it "Should accept \`--version\`"
    $COMMAND --version > /dev/null 2>&1
    assert $? 0

it "Should accept \`-V\`"
    $COMMAND -V > /dev/null 2>&1
    assert $? 0

#
# `--`
#

it "Should stop parsing arguments after \`--\`"
    $COMMAND $markdown -- $missing > /dev/null 2>&1
    assert $? 0

#
# Unknown flags.
#

it "Should fail on unknown short options"
    $COMMAND -v > /dev/null 2>&1
    assert $? 1

it "Should fail on unknown long options"
    $COMMAND --verbose > /dev/null 2>&1
    assert $? 1

printf "\033[32m\n(✓) Passed $tests assertions without errors\033[0m\n";
