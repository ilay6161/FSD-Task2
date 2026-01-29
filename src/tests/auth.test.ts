import request from 'supertest';
import initApp from '../app';
import { Express } from 'express';
import User from '../model/userModel';
import { userData } from './utils';
import jwt from 'jsonwebtoken';

let app: Express;

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({});
});

afterAll(async () => {
  await User.deleteMany({});
});

describe('Test Auth Suite', () => {
  test('Test post without token fails', async () => {
    const response = await request(app).post('/post').send({ title: 'Test', content: 'Test' });
    expect(response.status).toBe(401);
  });

  test('Test Registration', async () => {
    const email = userData.email;
    const password = userData.password;
    const username = userData.username;
    const response = await request(app).post('/auth/register').send({
      username,
      email,
      password,
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    userData.token = response.body.token;
    expect(response.body).toHaveProperty('refreshToken');
    userData.refreshToken = response.body.refreshToken;
    const decoded = jwt.decode(userData.token) as { _id: string };
    userData._id = decoded._id;
  });

  test('Test create a post with token succeeds', async () => {
    const postData = { title: 'Test Post', content: 'Test Content' };
    const response = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + userData.token)
      .send(postData);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  test('Test create a post with compromised token fails', async () => {
    const postData = { title: 'Test Post', content: 'Test Content' };
    const compromisedToken = userData.token + 'a';
    const response = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + compromisedToken)
      .send(postData);
    expect(response.status).toBe(401);
  });

  test('Test Login', async () => {
    const email = userData.email;
    const password = userData.password;
    const response = await request(app).post('/auth/login').send({
      email,
      password,
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refreshToken');
    userData.token = response.body.token;
    userData.refreshToken = response.body.refreshToken;
  });

  test('Test Login with invalid credentials', async () => {
    const response = await request(app).post('/auth/login').send({
      email: userData.email,
      password: 'wrongpassword',
    });
    expect(response.status).toBe(401);
  });

  test('Test using token after expiration fails', async () => {
    jest.setTimeout(15000);
    process.env.JWT_EXPIRES_IN = '5';
    
    const expiredUserResponse = await request(app).post('/auth/register').send({
      username: 'expireduser',
      email: 'expired@example.com',
      password: 'expiredpass123',
    });
    const expiredToken = expiredUserResponse.body.token;
    const expiredRefreshToken = expiredUserResponse.body.refreshToken;
    
    await new Promise((r) => setTimeout(r, 6100));
    
    const postData = { title: 'Test Post', content: 'Test Content' };
    const response = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + expiredToken)
      .send(postData);
    expect(response.status).toBe(401);

    const refreshResponse = await request(app).post('/auth/refresh')
      .send({
        refreshToken: expiredRefreshToken,
      });
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty('token');
    const newToken = refreshResponse.body.token;

    process.env.JWT_EXPIRES_IN = '3600';
    
    const retryResponse = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + newToken)
      .send(postData);
    expect(retryResponse.status).toBe(201);
  }, 15000);

  test('Test double use of refresh token fails and clears sessions', async () => {
    const doubleUseUserResponse = await request(app).post('/auth/register').send({
      username: 'doubleuser',
      email: 'double@example.com',
      password: 'doublepass123',
    });
    const doubleRefreshToken = doubleUseUserResponse.body.refreshToken;

    const refreshResponse1 = await request(app).post('/auth/refresh')
      .send({
        refreshToken: doubleRefreshToken,
      });
    expect(refreshResponse1.status).toBe(200);
    expect(refreshResponse1.body).toHaveProperty('token');
    expect(refreshResponse1.body).toHaveProperty('refreshToken');
    const newRefreshToken = refreshResponse1.body.refreshToken;
    const refreshResponse2 = await request(app).post('/auth/refresh')
      .send({
        refreshToken: doubleRefreshToken,
      });
    expect(refreshResponse2.status).toBe(401);

    const refreshResponse3 = await request(app).post('/auth/refresh').send({
      refreshToken: newRefreshToken,
    });
    expect(refreshResponse3.status).toBe(401);
  });

  test('Test Logout', async () => {
    const logoutUserResponse = await request(app).post('/auth/register').send({
      username: 'logoutuser',
      email: 'logout@example.com',
      password: 'logoutpass123',
    });
    const logoutRefreshToken = logoutUserResponse.body.refreshToken;
    const response = await request(app)
      .post('/auth/logout')
      .set('Authorization', 'Bearer ' + logoutRefreshToken);
    expect(response.status).toBe(200);
  });
});
