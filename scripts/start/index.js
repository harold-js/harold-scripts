import spawn from 'cross-spawn';
import handler from 'serve-handler';
import http from 'node:http';
import chokidar from 'chokidar';
import config from '../build/constants.js';
import chokidarCallback from './listener-callback.js';

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
