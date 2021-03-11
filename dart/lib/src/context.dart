import 'dart:io';

import 'router.dart';

class Context {
  String uri;
  String method;

  Map<String, String> params;
  Map<String, String> queryParams;

  List<Handler> handlers;
  int statusCode;
  HttpRequest request;
  HttpResponse response;
  int _nextIdx = -1;

  Context(HttpRequest req, HttpResponse res) {
    this.uri = req.uri.path;
    this.method = req.method;
    this.request = req;
    this.response = res;
    this.statusCode = 200;
    this.handlers = [];
    this.params = new Map<String, String>();
    this.queryParams = new Map<String, String>();
  }

  next() async {
    this._nextIdx++;
    if (this._nextIdx >= this.handlers.length) return;

    try {
      await this.handlers[this._nextIdx](this);
    } catch (e) {
      print(e);
      this.abort();
    }
  }

  abort() {
    this._nextIdx = this.handlers.length;
  }

  send(String data) {
    this.response.statusCode = this.statusCode ?? 200;
    this.response.write(data);
    this.response.close();
  }
}

