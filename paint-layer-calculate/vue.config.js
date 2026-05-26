const detectPort = require('detect-port');

module.exports = async () => {
  const defaultPort = 8080;
  const port = await detectPort(defaultPort);
  
  return {
    devServer: {
      port: port,
      open: true
    },
    css: {
      loaderOptions: {
        less: {
          lessOptions: {
            javascriptEnabled: true
          }
        }
      }
    }
  };
};
