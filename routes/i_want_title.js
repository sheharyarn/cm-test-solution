var express = require('express');
var request = require('request');
var async   = require('async');
var router  = express.Router();

var titleRegex = new RegExp("<title>(.*?)</title>", "i");

// I Want Title!

router.get('/', function(req, res) {
    // Globalize these vars
    counter   = 0;
    addresses = [];
    sites     = {};
    gres      = res;

    if (req.query.address) {
        // Populate 'addresses' depending on the number of address queries
        if (req.query.address instanceof Array) {
            addresses = req.query.address;
        } else {
            addresses = [req.query.address];
        }


        // ## Use one at a time, either series or parallel

        // // Use 'async' to pull titles in parallel
        // async.map(addresses, getPageTitle, asyncCallback);
        
        // Use 'async' to pull titles in series
        async.mapSeries(addresses, getPageTitle, asyncCallback);

        // ## 

    } else {
        serveWebpage(null);
    }
});

// 'async' needs a callback function
function asyncCallback(err, results) {
    if (err) {
        console.log("There was an error with Async: " + err);
    }

    // No need to use 'results', already being handled in 'getPageTitle' method
}

function getPageTitle(ourl, urlCallback) {
    console.log("Trying: " + ourl);

    // Prepend 'http://' if it isn't already there
    var url = ourl;
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
        url = 'http://' + url;
    }

    // Make the request
    request(url, function(err, response, body) {
        if (err) {
            console.log(err);
            callback(ourl, 'Error Requesting Website')
            urlCallback(null);
            return;
        }

        // Find the title tag using regex
        var match = titleRegex.exec(body);
        if (match && match[1]) {
            callback(ourl, '"' + match[1] + '"');
        } else {
            callback(ourl, 'Could not find Title Tag');
        }

        // Finish and callback to 'async'
        console.log('Finished: ' + ourl);
        urlCallback(null);
    });

}

// Callback function to update the 'sites' object
function callback(url, siteTitle) {
    sites[url] = siteTitle;
    counter++;

    // Finally serve webpage when all addresses have been dealt with
    if (counter == addresses.length) {
        serveWebpage(sites);
    }
}


// Function to serve the webpage
function serveWebpage(sitesObject) {
    gres.render('i_want_title', {
        sites: sitesObject,
        title: 'I Want Title!' 
    });
}


module.exports = router;
