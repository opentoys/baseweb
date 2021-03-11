
import 'dart:math';

import 'context.dart';

typedef Handler = Future<void> Function(Context);

class Router {
  String uri;
  String method;

  List<Handler> handlers;

  Map<String, Router> _children;
  Map<String, Router> _regexpChildren;
  Map<String, Router> _universalChildren;

  Router(String method, String uri) {
    this.method = method;
    if (uri.indexOf("/") == 0) {
      this.uri = uri.substring(1);
    } else {
      this.uri = uri;
    }
    this.handlers = [];
    this._children = new Map<String, Router>();
    this._regexpChildren = new Map<String, Router>();
    this._universalChildren = new Map<String, Router>();
  }

  Router _add(String method, String uri, Handler fn) {
    List<String> uris = uri.split("/").sublist(1);
    Router r = this;
    for (int i = 0; i < uris.length; i++) {
      print(uris[i]);
      Router lr = new Router(method, uris[i]);
      if (lr.uri.indexOf(":") == 0) {
        // 通配
        lr.uri = uris[i].substring(1);
        r._universalChildren[method] = lr;
      } else if (lr.uri.indexOf("#") == 0) {
        // 正则
        lr.uri = uris[i].substring(1);
        r._regexpChildren[method] = lr;
      } else {
        // 精确
        r._children[method+"-"+uris[i]] = lr;
      }
      r = lr;
    }
    if (fn != null) r.handlers = [fn];
    return r;
  }

  Router use(Handler fn) {
    this.handlers.add(fn);
    return this;
  }

  Router hook(Router r) {
    this._children["${r.method}-${r.uri}"] = r;
    return this;
  }

  get(String uri, Handler fn) {
    this._add("GET", uri, fn);
  }

  post(String uri, Handler fn) {
    this._add("POST", uri, fn);
  }

  Router group(String uri) {
    return this._add("ANY", uri, null);
  }

  find(Context ctx) {
    List<String> uris = ctx.uri.split("/").sublist(1);
    uris.add("");
    Router r = this;
    ctx.handlers.addAll(r.handlers);
    for(var i = 0; i < uris.length; i++) {
      Router nr = r._children["${ctx.method}-${uris[i]}"] ?? r._children["ANY-${uris[i]}"];
      // 判断正则
      if (nr == null && r._regexpChildren[ctx.method] != null) {
        Router lr = r._regexpChildren[ctx.method];
        var reg = new RegExp(lr.uri);
        if (reg.hasMatch(uris[i])) {
          nr = lr;
          // 正则匹配逻辑
          reg.allMatches(uris[i]).forEach((v) {
            for(var g in v.groupNames.toList()) {
              ctx.params[g] = v.namedGroup(g);
            }
          });
        }
      }
      // 判断通配
      if (nr == null && r._universalChildren[ctx.method] != null) {
        nr = r._universalChildren[ctx.method];
        ctx.params[nr.uri] = uris[i];
      }
      // 增加404
      if (nr == null) {
        ctx.handlers.add((Context ctx) async {
          ctx.statusCode = 404;
          ctx.send("Not found");
        });
      } else {
        ctx.handlers.addAll(nr.handlers);
        r = nr;
      }
    }
    ctx.next();
  }
}