import * as http from "http";
import {Router} from "./router";
import {Context} from "./context";

export class Application extends Router {
    server: http.Server;
    errorHandler: (err: Error, ctx: Context) => Promise<void>;
    constructor() {
        super("");
  
        this.errorHandler = async (err, ctx) => {
            ctx.statusCode = 500;
            ctx.send(err.stack ?? 'server error');
        }
        // 查询中间执行函数
        this.server = http.createServer((req, res) => {
            const ctx = new Context(req, res);
            ctx.errorHandler = this.errorHandler;
            ctx.timeout(10 * 1000);
            this.find(ctx);
        });
    }

    listen(addr: string) {
        this.server.listen(addr);
    }
}
