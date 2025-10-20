const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // В контейнере фронта обращаемся к сервису бэка по имени
  const target = 'http://backend:8080';
  app.use(
    '/api',
    createProxyMiddleware({
      target: `${target}`,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        // бэк уже слушает на /api → путь оставляем как есть
        return path;
      },
      onProxyReq: (proxyReq) => {
        // пробрасываем куки/авторизацию как есть
      },
    })
  );
};


