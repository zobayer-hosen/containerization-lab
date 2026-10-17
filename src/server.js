const app = require('./app');
const pool = require('./db/pool');
const { port } = require('./config');

const server = app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

// `docker stop` sends SIGTERM; finish in-flight requests and close the pool.
function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
