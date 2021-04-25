const spawn = require('cross-spawn');
const handler = require('serve-handler');
const http = require('http');
const chokidar = require('chokidar');
const config = require('../build/constants');
const chokidarCallback = require('./listener-callback');

// Initial build
const result = spawn.sync('harold-scripts', ['build'], { stdio: 'inherit' });

if (!result.error) {
  const server = http.createServer((request, response) => {
    return handler(request, response, {
      public: config.publicDirName,
      headers: [
        {
          source: '**/*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache',
            },
          ],
        },
      ],
    });
  });

  server.listen(process.env.PORT || 3000, () => {
    console.log(
      `Dev server running at http://localhost:${process.env.PORT || 3000}`
    );
  });

  // listen for changes
  chokidar
    .watch(config.srcDirName, {
      ignoreInitial: true,
      ignored: `${config.srcDirName}/${config.jsonDataDirName}`,
    })
    .on('all', chokidarCallback);
}
