var http    = require('http');
var express = require('express');
var request = require('request');
var router  = express.Router();

var titleRegex = new RegExp("<title>(.*?)</title>", "i");

// I Want Title!

router.get('/', function(req, res) {
    // Globalize these vars
    counter   = 0;
    addresses = [];
    sites     = {};
    gres      = res;

    // Populate 'addresses' depending on the number of address queries
    if (req.query.address instanceof Array) {
        addresses = req.query.address;
    } else {
        addresses = [req.query.address];
    }

    // 'Try' to get titles of these addresses
    for (var i=0; i < addresses.length; i++) {
        getPageTitle(addresses[i]);
    }
});


function getPageTitle(ourl) {
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
            return;
        }

        // Find the title tag using regex
        var match = titleRegex.exec(body);
        if (match && match[1]) {
            callback(ourl, '"' + match[1] + '"');
        } else {
            callback(ourl, 'Could not find Title Tag');
        }
    });

}

// Callback function to update the 'sites' object
function callback(url, siteTitle) {
    sites[url] = siteTitle;
    counter++;

    // Finally serve webpage when all addresses have been dealt with
    if (counter == addresses.length) {
        gres.render('i_want_title', {
            sites: sites,
            title: 'I Want Title!' 
        });
    }
}


module.exports = router;
