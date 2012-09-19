var os = require('os');
var http = require('http');
var exec = require('child_process').exec;
var options = {
    host: 'app.nimbits.com',
    port: 80,
    path: '/service/currentvalue',
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
};

var oneMin = 60000;
var cookie;

setInterval(function () {
    var child = exec('./get-location/get-location', function (error, stdout, stderr) {
        var location = stdout.match(/^Location.*<(.*),(.*)>/);
        var avg1m = (os.loadavg()[0] / os.cpus().length).toFixed(2);
        var data = 'point=CPUload';
        data += '&email=authere%40gmail.com';
        data += '&uuid=d2a992f1-26f5-400a-837c-4ba10af037b9';
        data += '&key=abc123';
        data += '&value=' + avg1m;
        data += '&lat=' + location[1];
        data += '&lng=' + location[2];

        options.headers['Content-Length'] = data.length;
        if(cookie) options.headers['Cookie'] = cookie;

        var req = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            if (res.headers['set-cookie']) {
                cookie = res.headers['set-cookie'];
            }
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
        });

        req.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });

        // write data to request body
        req.write(data);
        req.end();

    });
}, oneMin);
