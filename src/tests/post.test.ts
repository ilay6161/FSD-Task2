import request from 'supertest';
import initApp from '../app';
import { Express } from 'express';
import User from '../model/userModel';
import Post from '../model/postModel';
import { userData, postsList } from './utils';
import jwt from 'jsonwebtoken';

let app: Express;
let postIds: string[] = [];

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({});
  await Post.deleteMany({});

  const registerResponse = await request(app).post('/auth/register').send({
    username: userData.username,
    email: userData.email,
    password: userData.password,
  });
  userData.token = registerResponse.body.token;
  const decoded = jwt.decode(userData.token) as { _id: string };
  userData._id = decoded._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
});

describe('Test Post Suite', () => {
  test('Test add post without token fails', async () => {
    const response = await request(app).post('/post').send(postsList[0]);
    expect(response.status).toBe(401);
  });

  test('Test add post with token succeeds', async () => {
    const response = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + userData.token)
      .send(postsList[0]);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    postIds.push(response.body._id);
  });

  test('Test get all posts', async () => {
    const response = await request(app)
      .get('/post')
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Test get posts by sender', async () => {
    const response = await request(app)
      .get('/post')
      .query({ sender: userData._id })
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Test get post by ID', async () => {
    const response = await request(app)
      .get(`/post/${postIds[0]}`)
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(postIds[0]);
  });

  test('Test update post succeeds', async () => {
    const response = await request(app)
      .put(`/post/${postIds[0]}`)
      .set('Authorization', 'Bearer ' + userData.token)
      .send({ title: 'Updated Title', content: 'Updated Content' });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Title');
  });

  test('Test delete post succeeds', async () => {
    const postResponse = await request(app)
      .post('/post')
      .set('Authorization', 'Bearer ' + userData.token)
      .send(postsList[1]);
    const postId = postResponse.body._id;

    const deleteResponse = await request(app)
      .delete(`/post/${postId}`)
      .set('Authorization', 'Bearer ' + userData.token);
    expect(deleteResponse.status).toBe(200);
  });

  test('Test delete post without token fails', async () => {
    const response = await request(app).delete(`/post/${postIds[0]}`);
    expect(response.status).toBe(401);
  });
});
