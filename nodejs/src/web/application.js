const http = require('http');
const Router = require('./router');
const Context = require('./context');

class Application extends Router{
    constructor() {
        super();
        this.errorHandler = async (err, ctx) => {
            ctx.statusCode = 500;
            ctx.send(err.stack || 'server error');
        };
        this.server = http.createServer((req, res) => {
            let ctx = new Context(req, res);
            this.find(ctx);
        });
    }

    listen(...args) {
        this.server.listen(...args);
    }
}

module.exports = Application;