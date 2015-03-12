var express      = require('express');
var path         = require('path');
var logger       = require('morgan');
var bodyParser   = require('body-parser');

var app          = express();


// View Engine Setup
// -----------------

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



// App Routes
// ----------

app.use('/I/want/title', require('./routes/i_want_title'));



// Error Handlers
// --------------

// Catch 404s and forward to Error Handlers
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// Development Error Handler
// Prints Stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production Error Handler
// No Stacktrace
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
