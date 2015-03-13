var express = require('express');
var request = require('request');
var bacon   = require('baconjs').Bacon;
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

        // Use 'Bacon' to get titles of these addresses
        for (var i=0; i < addresses.length; i++) {
            var getTitle = bacon.fromNodeCallback(getPageTitle, addresses[i]);
            var site = addresses[i];

            getTitle.onError(function(error) {
                finalCallback(error);
                console.log("Reading failed: " + error);
            });
            getTitle.onValue(function(value) {
                finalCallback(value);
                console.log("Read contents: " + value); 
            });
        }
        
    } else {
        serveWebpage(null);
    }
});


// The Bacon Function
function getPageTitle(ourl, baconCallback) {
    // Prepend 'http://' if it isn't already there
    var url = ourl;
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
        url = 'http://' + url;
    }

    // Make the request
    request(url, function(err, response, body) {
        if (err) {
            console.log(err);
            baconCallback([ourl, 'Error Requesting Website'], null);
            return;
        }

        // Find the title tag using regex
        var match = titleRegex.exec(body);
        if (match && match[1]) {
            baconCallback(null, [ourl, '"' + match[1] + '"']);
        } else {
            baconCallback([ourl, 'Could not find Title Tag'], null);
        }
    });

}


// Callback function to update the 'sites' object
function finalCallback(array) {
    url = array[0];
    msg = array[1];

    sites[url] = msg;
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
