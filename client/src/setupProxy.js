const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );

  // Proxy WebSocket connections
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://backend:5000',
      changeOrigin: true,
      ws: true,
      logLevel: 'debug'
    })
  );
}; 