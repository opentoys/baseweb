## baseweb

> 基础web框架开发及学习项目, 涉及多种语言。
> 每种语言均包含框架, 实例代码, 单元测试

#### Web 框架内容
   1. 路由管理 (使用每种语言的`map`实现)
   2. 路由分类 -> 精确(空格, uri), 正则匹配(`/api/#\.html$`, 禁用字符`/`), 通配(`/api/:params`)
   3. 中间件 (必须调用`ctx.next`方法)
   4. 错误处理
   5. 多级路由挂载
   6. 单元测试

#### 框架单独使用(伪代码)
```java
const app = new WebApplication();

// 全局中间件
app.use((Context ctx) {
    console.log("middleware by app start");
    // request
    ctx.next(); // 后边使用 async 异步函数时, 使用 await/ .then方法调用
    // response
    console.log("middleware by app end");
});

app.get("/io", (Context ctx) {
    ctx.send("");
});

const router = new Router("/api");
const group = router.group("/customer");

router.use((Context ctx) {
    console.log("middleware by router start");
    ctx.next();
    console.log("middleware by router end");
});

group.use((Context ctx) {
    console.log("middleware by group start");
    ctx.next();
    console.log("middleware by group end");
});

group.get("/:id", (Context ctx) {
    ctx.send("hello ${ctx.params.id}");
});

group.get("/info", (Context ctx) {
    ctx.send("hello customer info");
});

group.post("/:id", (Context ctx) {
    ctx.send("hello post ${ctx.params.id}");
});

router.get("/data", (Context ctx) {
    ctx.send("hello data");
});

// 挂载路由, 可以实现函数重载的语言, 使用 app.use(router) 即可
app.hook(router);

app.listen("12345");
```