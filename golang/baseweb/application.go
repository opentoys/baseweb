package baseweb

import "net/http"

// Application 入口
type Application struct {
	*Router
}

// NewApplication 初始化项目
func NewApplication() *Application {
	a := &Application{
		Router: NewRouter("ANY", ""),
	}

	return a
}

func (a *Application) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := NewContext(w, r)
	a.find(ctx)
}

// Listen 监听服务
func (a *Application) Listen(addr string) {
	http.ListenAndServe(addr, a)
}
