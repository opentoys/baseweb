
class Context {
    nextInx = -1;
    constructor(req, res) {
        this.request = req;
        this.response = res;
        this.responseHeader = new Map();
        let u = new URL("http://a.com"+req.url);
        this.url = req.url;
        this.middleware = [];
        this.params = new Map();
        this.query = u.searchParams;
        this.method = req.method.toLocaleUpperCase() || "GET";
        this.errorHandler = async (err, ctx) => {};
    }

    timeout(time){
        if (time <= 0) return;
        setTimeout(() => {
            this.statusCode = 500;
            this.send("server timeout");
        }, time);
    }

    next() {
        console.log(this.nextInx)
        this.nextInx += 1;
        if (this.nextInx >= this.middleware.length) return;

        try {
            this.middleware[this.nextInx](this);
        } catch (err) {
            this.nextInx = this.middleware.length;
            this.errorHandler(err, this);
        }
    }

    abort() {
        this.nextInx = this.middleware.length;
    }

    /**
     * @param {String} 响应数据 
     */
    send(str) {
        this.response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        for(let key in this.responseHeader.keys()) {
            this.response.setHeader(key, this.responseHeader.get(key) || '');
        }
        this.response.statusCode = this.statusCode || 200;
        this.response.write(str);
        this.response.end();
        this.isEnd = true;
    }

    /**
     * @param {Object} 响应数据 
     */
    json(str) {
        this.response.setHeader('Content-Type', 'application/json; charset=utf-8');
        for(let key in this.responseHeader.keys()) {
            this.response.setHeader(key, this.responseHeader.get(key) || '');
        }
        this.response.statusCode = this.statusCode || 200;
        this.response.write(str);
        this.response.end();
        this.isEnd = true;
    }

    /**
     * @name 设置响应头
     * @param {String} key 
     * @param {String} value 
     */
    setHeader(key, value) {
        if (!key) return;
        this.responseHeader.set(key.toLocaleLowerCase(), value);
    }


}

module.exports = Context;