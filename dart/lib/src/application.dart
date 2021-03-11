import 'dart:io';

import 'context.dart';
import 'router.dart';

class Application extends Router {
  HttpServer server;
  Application() : super("ANY", "") {

  }

  listen(String addr, int port) async {
    this.server = await HttpServer.bind(addr, port);
    this.server.listen((req) {
      var ctx = new Context(req, req.response);
      this.find(ctx);
    });
  }
}