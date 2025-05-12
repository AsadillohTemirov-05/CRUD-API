import request from 'supertest';
import { createServer } from 'http';
import { handleRequest } from '../src/app';

const server = createServer(handleRequest);

describe('Users API', () => {
  let userId: string

  afterAll(() => {
    server.close();
  });

  test('GET /api/users should return empty array initially', async () => {
    const response = await request(server).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('POST /api/users should create a new user', async () => {
    const newUser = {
      username: 'John Doe',
      age: 30,
      hobbies: ['reading', 'gaming'],
    };

    const response = await request(server)
      .post('/api/users')
      .send(newUser);
     
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(newUser.username);
    expect(response.body.age).toBe(newUser.age);
    expect(response.body.hobbies).toEqual(newUser.hobbies);

    userId = response.body.id;
  });

  test('GET /api/users/:userId should return created user', async () => {
    const response = await request(server).get(`/api/users/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  test('PUT /api/users/:userId should update user', async () => {
    const updatedUser = {
      username: 'Jane Doe',
      age: 31,
      hobbies: ['painting'],
    };

    const response = await request(server)
      .put(`/api/users/${userId}`)
      .send(updatedUser);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
    expect(response.body.username).toBe(updatedUser.username);
    expect(response.body.age).toBe(updatedUser.age);
    expect(response.body.hobbies).toEqual(updatedUser.hobbies);
  });

  test('DELETE /api/users/:userId should delete user', async () => {
    const response = await request(server).delete(`/api/users/${userId}`);
    expect(response.status).toBe(204);
  });

  test('GET /api/users/:userId should return 404 for deleted user', async () => {
    const response = await request(server).get(`/api/users/${userId}`);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});