/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer. All rights reserved.
 * @module file-pipeline/queue
 * @fileoverview Queue all files which came this far.
 */

'use strict';

/**
 * Queue all files which came this far.
 * When the last file gets here, run the file-set pipeline
 * and flush the queue.
 *
 * @example
 *   var fileSet = new FileSet(cli);
 *   var file = new File();
 *
 *   file.originalPath = '~/foo/bar.md';
 *   fileSet.add(file);
 *
 *   queue({'file': file, 'fileSet': fileSet}, console.log);
 *
 * @param {Object} context
 * @param {function(Error?)} done
 */
function queue(context, done) {
    var fileSet = context.fileSet;
    var original = context.file.originalPath;
    var complete = true;
    var map = fileSet.complete;

    if (!map) {
        map = fileSet.complete = {};
    }

    map[original] = done;

    fileSet.valueOf().forEach(function (file) {
        var key = file.originalPath;

        if (file.hasFailed()) {
            return;
        }

        if (typeof map[key] !== 'function') {
            complete = false;
        }
    });

    if (!complete) {
        return;
    }

    fileSet.pipeline.run(fileSet, function (err) {
        /*
         * Flush.
         */

        for (original in map) {
            map[original](err);
        }
    });
}

/*
 * Expose.
 */

module.exports = queue;
