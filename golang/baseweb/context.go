package baseweb

import (
	"context"
	"fmt"
	"net/http"
)

// Context 上下文
type Context struct {
	request  *http.Request
	response http.ResponseWriter

	context.Context
	URI         string
	Method      string
	Params      map[string]string
	QueryParams map[string]string
	middleware  []Handler
	nextIdx     int
	StatusCode  int
}

// NewContext 创建上下文
func NewContext(res http.ResponseWriter, req *http.Request) *Context {
	return &Context{
		request:     req,
		response:    res,
		Context:     context.Background(),
		URI:         req.URL.Path,
		Method:      req.Method,
		StatusCode:  200,
		Params:      make(map[string]string),
		QueryParams: make(map[string]string),
		middleware:  make([]Handler, 0),
		nextIdx:     -1,
	}
}

// Next 下一步
func (c *Context) Next() {
	c.nextIdx++
	if c.nextIdx >= len(c.middleware) {
		return
	}
	c.middleware[c.nextIdx](c)
}

// Send 发送响应
func (c *Context) Send(data string) {
	c.response.WriteHeader(c.StatusCode)
	fmt.Fprintf(c.response, data)
}
