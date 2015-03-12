var express = require('express');
var request = require('request');
var rsvp    = require('rsvp');
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

        // Make promises to pull titles of each address
        for (var i=0; i < addresses.length; i++) {
            getPageTitle(addresses[i]).then(
                // Promise Kept
                function(kept) {
                    var url  = kept[0];
                    var resp = kept[1];
                    callback(url, resp);
                },
                // Promise Broken
                function(broken) {
                    var url    = broken[0];
                    var reason = broken[1];
                    callback(url, reason);
                }
            );
        }

    } else {
        serveWebpage(null);
    }
});


// The Promise to pull titles
function getPageTitle(ourl, urlCallback) {
    // Prepend 'http://' if it isn't already there
    var url = ourl;
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
        url = 'http://' + url;
    }

    var promise = new rsvp.Promise(function(resolve, reject) {
        console.log("Trying: " + ourl);

        // Make the request
        request(url, function(err, response, body) {
            if (err) {
                // Reject the promise on error
                console.log(err);
                reject([ourl, 'Error Requesting Website']);
                return;
            }

            // Find the title tag using regex, and resolve the promise
            var match = titleRegex.exec(body);
            if (match && match[1]) {
                resolve([ourl, '"' + match[1] + '"']);
            } else {
                // reject the promise if doc doesn't contain the title tag
                reject([ourl, 'Could not find Title Tag']);
            }

            console.log('Finished: ' + ourl);
        });
    });

    return promise;
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
