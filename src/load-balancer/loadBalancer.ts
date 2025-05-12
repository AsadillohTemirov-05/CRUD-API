import * as dotenv from 'dotenv';
import { createServer } from 'http';
import cluster from 'cluster';
import { cpus } from 'os';
import { handleRequest } from '../app';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000');
const numCPUs = cpus().length - 1;
const workers: number[] = [];

let currentWorkerIndex = 0;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    const workerPort = PORT + i + 1;
    const worker = cluster.fork({ WORKER_PORT: workerPort });
    workers.push(workerPort);
  }

  const balancer = createServer(async (req, res) => {
    const workerPort = workers[currentWorkerIndex];
    currentWorkerIndex = (currentWorkerIndex + 1) % workers.length;

    const options = {
      hostname: 'localhost',
      port: workerPort,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = createServer().request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal server error' }));
    });

    req.pipe(proxyReq);
  });

  balancer.listen(PORT, () => {
    console.log(`Load balancer running on port ${PORT}`);
  });

} else {
  const workerPort = process.env.WORKER_PORT;
  const server = createServer(async (req, res) => {
    await handleRequest(req, res);
  });
     
  server.listen(workerPort, () => {
    console.log(`Worker ${process.pid} running on port ${workerPort}`);
  });
}