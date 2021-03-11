import '../lib/baseweb.dart';

void main() {
  var app = new Application();

  // 全局中间件
  app.use((Context ctx) async {
      print("middleware by app start");
      // request
      ctx.next(); // 后边使用 async 异步函数时, 使用 await/ .then方法调用
      // response
      print("middleware by app end");
  });

  app.get("/io", (Context ctx) async {
      ctx.send("hello io");
  });

  Router router = new Router("ANY","/api");
  Router group = router.group("/customer");

  router.use((Context ctx) async {
      print("middleware by router start");
      ctx.next();
      print("middleware by router end");
  });

  group.use((Context ctx) async {
      print("middleware by group start");
      ctx.next();
      print("middleware by group end");
  });

  group.get("/:id", (Context ctx) async {
      ctx.send("hello ${ctx.params["id"]}");
  });

  group.get("/#[a-z]", (Context ctx) async {
      ctx.send("hello customer regex");
  });

  group.get("/info", (Context ctx) async {
      ctx.send("hello customer info");
  });

  group.post("/:id", (Context ctx) async {
      ctx.send("hello post ${ctx.params["id"]}");
  });

  router.get("/data", (Context ctx) async {
      ctx.send("hello data");
  });

  // 挂载路由, 可以实现函数重载的语言, 使用 app.use(router) 即可
  app.hook(router);

  app.listen("127.0.0.1", 12346);
}