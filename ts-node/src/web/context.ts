import * as http from "http";
import {URL} from "url";
import {Handler} from "./router";


export class Context {
    request: http.IncomingMessage;
    response: http.ServerResponse;
    query: URLSearchParams;
    body: any;
    url: string;
    method: string;
    params: Map<String, string> = new Map<String, string>();
    session: any;
    isEnd: boolean = false;
    nextInx: number = -1;
    statusCode:number = 200;
    middleware:Handler[] = [];
    errorHandler: (err: Error, ctx: Context) => Promise<void>;
    responseHeader: Map<String, string> = new Map<String, string>();
    constructor(req: http.IncomingMessage, res: http.ServerResponse) {
        this.request = req;
        this.response = res;
        let u = new URL("http://a.com"+req.url);
        this.url = u.pathname;
        this.query = u.searchParams;
        this.method = req.method?.toLocaleUpperCase() ?? "GET";
        this.errorHandler = async (err, ctx) => {};
    }

    timeout(time: number){
        if (time <= 0) return;
        setTimeout(() => {
            this.statusCode = 500;
            this.send("server timeout");
        }, time);
    }

    next(info?: any) {
        this.nextInx += 1;
        console.log(this.nextInx)
        if (this.nextInx >= this.middleware.length || this.isEnd) return;

        try {
            this.middleware[this.nextInx](this);
        } catch (err) {
            this.nextInx = this.middleware.length -1;
            this.errorHandler(err, this);
        }
    }

    send(str: string) {
        if (this.isEnd) return;
        this.response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        for(let key in this.responseHeader.keys()) {
            this.response.setHeader(key, this.responseHeader.get(key) ?? '');
        }
        this.response.statusCode = this.statusCode || 200;
        this.response.write(str);
        this.response.end();
        this.isEnd = true;
    }

    json(str: Object) {
        if (this.isEnd) return;
        this.response.setHeader('Content-Type', 'application/json; charset=utf-8');
        for(let key in this.responseHeader.keys()) {
            this.response.setHeader(key, this.responseHeader.get(key) ?? '');
        }
        this.response.statusCode = this.statusCode || 200;
        this.response.write(str);
        this.response.end();
        this.isEnd = true;
    }

    setHeader(key: string, value: string) {
        this.responseHeader.set(key, value);
    }
}