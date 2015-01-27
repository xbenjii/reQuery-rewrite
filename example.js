var reQ = require('./reQ');

var query = new reQ.Query({
        buffer: '\xff\xff\xff\xffgetservers IW4 61586 full empty\x00',
        host: '92.222.217.186',
        port: 20810,
        debug: false,
        listenerPort: 1337
    })
    .then(parse)
    .then(function(servers) {
        return servers.map(function(server) {
            return new reQ.Query({
                buffer: '\xff\xff\xff\xffgetinfo\x00',
                host: server
            });
        });
    }).settle().then(function(serverData) {
        console.log(serverData.map(function(data) {
            if (data.isFulfilled()) 
                return data.value();
            else if (data.isRejected())
                return data.reason();
        }));
    })
    .catch(function(error) {
        console.log(error);
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
