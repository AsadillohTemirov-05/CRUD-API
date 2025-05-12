import { IncomingMessage, ServerResponse } from 'http';
import { handleUsers } from './api/users';

export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = req.url || '';
  
  if (url.startsWith('/api/users')) {
    await handleUsers(req, res);
    return;
  }            
         
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Resource not found' }));
}