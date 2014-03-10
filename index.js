/**
 * lastModified Plugin
 * check freshness of the content
 */
var fs   = require('fs');
var ejs  = require('ejs');
var util = require('util');

var template = fs.readFileSync(__dirname + '/views/_detailsEdit.ejs', 'utf8');

exports.initWebApp = function(options) {

    var dashboard = options.dashboard;

    dashboard.on('populateFromDirtyCheck', function(checkDocument, dirtyCheck, type) {
        if (type !== 'http' && type !== 'https') return;
        var match = dirtyCheck.lastModified;
        checkDocument.setPollerParam('lastModified', match);
    });

    dashboard.on('checkEdit', function(type, check, partial) {
        if (type !== 'http' && type !== 'https') return;
        check.lastModified = '';
        var options = check.getPollerParam('lastModified');
        check.setPollerParam('lastModified', options);
        partial.push(ejs.render(template, { locals: { check: check } }));
    });

};

exports.initMonitor = function(options) {

    options.monitor.on('pollerPolled', function(check, res, details) {
        if (check.type !== 'http' && check.type !== 'https') return;
        var lastModified = check.pollerParams && check.pollerParams.lastModified;
        if (!lastModified) return;

        dateFile=Date.parse( res.headers['last-modified']);
        today=new Date().getTime();
        if((today - dateFile) > lastModified*1000){
            throw new Error("File is too old.");
        }
        return;
   });

};
