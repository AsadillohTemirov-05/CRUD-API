import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { handleRequest } from './app';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = createServer(async (req, res) => {
  await handleRequest(req, res);
});       

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});      




