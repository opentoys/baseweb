/**
 * @name Router 路由相关处理
 */

class Router {
    /**
     * @name 子路由
     * @type {Map<Method, Router>}
     */
     childrenRoute = new Map();
    /**
     * @name 路由路径uri
     * @type {String}
     */
    uri;
    /**
     * @name 中间件
     * @type {Array<Handler>}
     */
    middleware = [];
    /**
     * @name 正则匹配路由
     * @type {Map<Method, Router>}
     */
    regexChildren = new Map();
    /**
     * @name 通配路由
     * @type {Map<Method, Router>}
     */
    universalChildren = new Map();
    /**
     * @name 注册方法
     * @type {String}
     */
    method;

    /**
     * @param {String} u 子路由uri
     */
    constructor(u) {
        u = u || '';
        if (u.indexOf('/') == 0) u = u.substr(1);
        if (u.indexOf(':') == 0) {
            this.type = 'universal';
        }

        if (u.indexOf('#') == 0) {
            this.type = 'regex';
        }

        this.uri = u;
    }

    hook(...routers) {
        for(let item of routers) {
            this.childrenRoute.set(`ANY-${item.uri}`, item);
        }
    }

    /**
     * @name 中间件
     * @param  {...Handler} handlers
     */
    use(...handlers) {
        this.middleware.push(...handlers);
    }

    get(uri, ...handlers) {
        return this.add('GET', uri, ...handlers)
    }

    post(uri, ...handlers) {
        return this.add('POST', uri, ...handlers)
    }

    put(uri, ...handlers) {
        return this.add('PUT', uri, ...handlers)
    }

    patch(uri, ...handlers) {
        return this.add('PATCH', uri, ...handlers)
    }

    delete(uri, ...handlers) {
        return this.add('DELETE', uri, ...handlers)
    }

    /**
     * @name 添加路由
     * @param {String} method 
     * @param {String} uri 
     * @param  {...Handler} handlers 
     * @returns {router} 返回值为最后一级的router
     */
    add(method, uri, ...handlers) {
        if (uri.indexOf('/') == 0) uri = uri.substr(1);
        const uris = uri.split('/');
        let r = this;
        // 循环添加
        for(let u of uris) {
            let nr = new Router(u);
            // 判断
            if (u.indexOf(':') == 0) {
                nr.type = 'universal';
                nr.uri = nr.uri.substr(1);
                r.universalChildren.set(method, nr);
            } else if (u.indexOf('#') == 0) {
                nr.type = 'regex';
                nr.uri = nr.uri.substr(1);
                r.regexChildren.set(method, nr);
            } else {
                r.childrenRoute.set(`${method}-${u}`, nr);
            }
            r = nr;
        }
        // 添加路由处理及中间件
        r.middleware.push(...handlers);
        return r;
    }
    
    group(uri) {
        return this.add('ANY',uri)
    }
    
    prefix(uri) {
        return this.add('ANY',uri)
    }

    find(ctx) {
        let uris = [...ctx.url.substr(1).split('/'), ""];
        let r = this;
        ctx.middleware.push(...r.middleware || []);
        // 查询递归执行子路由
        for(let i = 0; i < uris.length; i++) {
            // 执行当前中间件
            let nr = r.childrenRoute.get(`${ctx.method}-${uris[i]}`) || r.childrenRoute.get(`ANY-${uris[i]}`) || null;
            if (r.regexChildren.get(ctx.method) && !nr) {
                nr = r.regexChildren.get(ctx.method) || null;
                if (!nr) break;

                let reg = new RegExp(nr.uri);
                if (!reg.test(uris[i])) {
                    // 正则匹配
                    let result = uris[i].match(reg);
                    if (result && result.groups) {
                        for(let k in result.groups) {
                            ctx.params.set(k, result.groups[k])
                        }
                    } else if (result) {
                        result.map((v,k) => {
                            ctx.params.set(`${i}-${k}`, v);
                        });
                    }
                }
            }

            if (r.universalChildren.get(ctx.method) && !nr) {
                nr = r.universalChildren.get(ctx.method) || null;
                if (nr) ctx.params.set(nr.uri, uris[i]);
            }
            // 如果没有查找到, 则查找模糊匹配项, 优先正则
            r = nr;
            if (r) {
                ctx.middleware.push(...r.middleware || []);
            } else {
                i = uris.length;
            }
        }

        // 如果没有查到最后的路由
        if (!r) ctx.middleware.push(async (ctx) => {
            ctx.statusCode = 404;
            ctx.send('Not found');
        });
        console.log(ctx)
        // 最后一次执行
        ctx.next();
    }
}

module.exports = Router;