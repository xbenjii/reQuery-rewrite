var Query = require('./reQ');

var query = new Query({
    buffer: '\xff\xff\xff\xffgetservers IW4 61586 full empty\x00',
    host: '92.222.217.186',
    port: 20810,
    debug: false,
    listenerPort: false
}).then(parse, function(error) {
    console.log('Error: %s', error);
}).then(function(servers) {
    console.log(servers);
});

function parse(buffer) {
    var servers = [];
    buffer = buffer.toString('binary').slice(0, -3).split(/\\/);
    buffer.forEach(function(server) {
        var len = server.length;
        if (len === 6) {
            var ip = '';
            for (var i = 0; i < len - 2; i++) {
                ip += server[i].charCodeAt(0) + '.';
            }
            ip = ip.slice(0, -1);
            port = (server[len - 2].charCodeAt(0) << 8) + server[len - 1].charCodeAt(0);
            servers.push(ip + ':' + port);
        }
    });
    return servers;
}