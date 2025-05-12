import { IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { Database } from '../db/database';
import { validateUserId, validateUserData, generateId } from '../utils/validator';
import { User } from '../types/user';

const db = Database.getInstance();

export async function handleUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {       
    const parsedUrl = parse(req.url || '', true);
    const pathParts = parsedUrl.pathname?.split('/') || [];
    const method = req.method?.toUpperCase();

    if (pathParts.length === 3 && pathParts[2] === 'users') {
      if (method === 'GET') {
        const users = db.getUsers();
        sendResponse(res, 200, users);        
        return;         
      }      
      if (method === 'POST'){
        const body = await getRequestBody(req);
        const userData: Partial<User> = JSON.parse(body);
        const validation = validateUserData(userData);

        if (!validation.isValid) {
          sendResponse(res, 400, { message: validation.message });
          return;
        }

        const newUser: User = {
          id: generateId(),
          username: userData.username!,
          age: userData.age!,
          hobbies: userData.hobbies || [],
        };

        db.addUser(newUser);
        sendResponse(res, 201, newUser);
        return;
      }
    }

    // Handle /api/users/:userId
    if (pathParts.length === 4 && pathParts[2] === 'users') {
      const userId = pathParts[3];

      if (!validateUserId(userId)) {
        sendResponse(res, 400, { message: 'Invalid user ID format' });
        return;
      }

      if (method === 'GET') {
        const user = db.getUserById(userId);
        if (!user) {
          sendResponse(res, 404, { message: 'User not found' });
          return;
        }
        sendResponse(res, 200, user);
        return;
      }

      if (method === 'PUT') {
        const body = await getRequestBody(req);
        const userData: Partial<User> = JSON.parse(body);
        const validation = validateUserData(userData);

        if (!validation.isValid) {
          sendResponse(res, 400, { message: validation.message });
          return;
        }

        const updatedUser = db.updateUser(userId, userData);
        if (!updatedUser) {
          sendResponse(res, 404, { message: 'User not found' });
          return;
        }
        sendResponse(res, 200, updatedUser);
        return;
      }

      if (method === 'DELETE') {
        const deleted = db.deleteUser(userId);
        if (!deleted) {
          sendResponse(res, 404, { message: 'User not found' });
          return;
        }
        sendResponse(res, 204, null);
        return;
      }
    }

    sendResponse(res, 404, { message: 'Resource not found' });
  } catch (error) {
    sendResponse(res, 500, { message: 'Internal server error' });
  }
}

async function getRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
}

function sendResponse(res: ServerResponse, statusCode: number, body: any): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  if (body !== null) {
    res.end(JSON.stringify(body));
  } else {
    res.end();
  }
}