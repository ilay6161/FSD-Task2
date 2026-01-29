import request from 'supertest';
import initApp from '../app';
import { Express } from 'express';
import User from '../model/userModel';
import { userData, userData2 } from './utils';
import jwt from 'jsonwebtoken';

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({});

  const registerResponse = await request(app).post('/auth/register').send({
    username: userData.username,
    email: userData.email,
    password: userData.password,
  });
  userData.token = registerResponse.body.token;
  const decoded = jwt.decode(userData.token) as { _id: string };
  userData._id = decoded._id;

  const register2Response = await request(app).post('/auth/register').send({
    username: userData2.username,
    email: userData2.email,
    password: userData2.password,
  });
  userData2.token = register2Response.body.token;
  const decoded2 = jwt.decode(userData2.token) as { _id: string };
  userData2._id = decoded2._id;
});

afterAll(async () => {
  await User.deleteMany({});
});

describe('Test User Suite', () => {
  test('Test get all users', async () => {
    const response = await request(app)
      .get('/user')
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  test('Test get user by ID', async () => {
    const response = await request(app)
      .get(`/user/${userData._id}`)
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(userData._id);
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('refreshTokens');
  });

  test('Test update user succeeds', async () => {
    const response = await request(app)
      .put(`/user/${userData._id}`)
      .set('Authorization', 'Bearer ' + userData.token)
      .send({ username: 'updatedusername', email: 'updated@example.com' });
    expect(response.status).toBe(200);
    expect(response.body.username).toBe('updatedusername');
    expect(response.body.email).toBe('updated@example.com');
  });

  test('Test update another user succeeds (no ownership check)', async () => {
    const response = await request(app)
      .put(`/user/${userData2._id}`)
      .set('Authorization', 'Bearer ' + userData.token)
      .send({ username: 'newusername2' });
    expect(response.status).toBe(200);
  });

  test('Test delete user succeeds', async () => {
    const registerResponse = await request(app).post('/auth/register').send({
      username: 'tempuser',
      email: 'temp@example.com',
      password: 'temppass123',
    });
    const tempToken = registerResponse.body.token;
    const tempDecoded = jwt.decode(tempToken) as any;
    const tempUserId = tempDecoded?._id?.toString ? tempDecoded._id.toString() : tempDecoded?._id;

    const response = await request(app)
      .delete(`/user/${tempUserId}`)
      .set('Authorization', 'Bearer ' + tempToken);
    expect(response.status).toBe(200);

    const getResponse = await request(app)
      .get(`/user/${tempUserId}`)
      .set('Authorization', 'Bearer ' + userData.token);
    expect(getResponse.status).toBe(404);
  });

  test('Test delete another user succeeds (no ownership check)', async () => {
    const registerResponse = await request(app).post('/auth/register').send({
      username: 'tempuser3',
      email: 'temp3@example.com',
      password: 'temppass123',
    });
    const tempToken = registerResponse.body.token;
    const tempDecoded = jwt.decode(tempToken) as any;
    const tempUserId = tempDecoded?._id?.toString ? tempDecoded._id.toString() : tempDecoded?._id;

    const response = await request(app)
      .delete(`/user/${tempUserId}`)
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
  });

  test('Test delete user without token fails', async () => {
    const response = await request(app).delete(`/user/${userData._id}`);
    expect(response.status).toBe(401);
  });
});
