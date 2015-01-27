var dgram = require('dgram'),
    Promise = require('bluebird'),
    lookup = Promise.promisify(require('dns').lookup);

var Query = function(options) {
    this.options = {};
    var self = this;
    return new Promise(function(resolve, reject) {
        self.promise = {
            resolve: resolve,
            reject: reject
        };
        self.setOptions(options);
        self.setupListener();
        self.lookup();
        self.sendQuery(self.options.buffer);
    });
};

Query.prototype.log = function(message) {
    if (this.options.hasOwnProperty('debug') && this.options.debug === true) {
        console.log(message);
    }
};

Query.prototype.setupListener = function() {
    var self = this;
    this.socket = dgram.createSocket('udp4');
    this.socket.unref();
    if (typeof this.options.listenerPort !== "undefined" && this.options.listenerPort !== false) {
        this.socket.bind(port);
        this.log('Bound to port: ' + port);
    }
    this.socket.on('message', function(buffer, info) {
        if (info.address == self.options.host && info.port == self.options.port) {
            self.socket.close();
            clearTimeout(self.timeout)
            return self.promise.resolve(buffer);
        }
    });
};

Query.prototype.sendQuery = function(buffer) {
    var self = this;
    if (typeof buffer === 'string') {
        buffer = new Buffer(buffer, 'binary');
    }
    if (!this.socket) {
        this.error('Socket is not setup');
    }
    process.nextTick(function() {
        self.socket.send(buffer, 0, buffer.length, self.options.port, self.options.host, function(error) {
            self.log('Sent buffer: ' + buffer + 'to ' + self.options.host + ':' + self.options.port);
            if (error) {
                self.error(error);
            }
            self.timeout = setTimeout(function() {
                self.error('Server timed out');
            }, self.options.timeout || 5000);
        });
    });
};

Query.prototype.error = function(error) {
    this.socket.close();
    this.promise.reject(error);
};


Query.prototype.setOption = function(key, option) {
    this.options[key] = option;
};

Query.prototype.setOptions = function(options) {
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            this.setOption(key, options[key]);
        }
    }
};

Query.prototype.lookup = function() {
    var self = this;
    if (!this.options.hasOwnProperty('host')) {
        this.error('No host defined');
    }
    if (/^\d+\.\d+\.\d+\.\d+$/.test(this.options.host)) {
        //Do nothing
    } else if (/^\d+\.\d+\.\d+\.\d+\:\d+$/.test(this.options.host)) {
        var temp = this.options.host.split(':');
        this.setOption('host', split[0]);
        this.setOption('port', split[1]);
    } else {
        lookup(this.options.host).then(function(address) {
            self.log(address);
            self.options.address = address[0];
        });
    }
    if (!this.options.hasOwnProperty('port')) {
        this.error('No port defined');
    }
};

module.exports = Query;