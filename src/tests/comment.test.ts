import request from 'supertest';
import initApp from '../app';
import { Express } from 'express';
import User from '../model/userModel';
import Post from '../model/postModel';
import Comment from '../model/commentModel';
import { userData, postsList, commentsList } from './utils';
import jwt from 'jsonwebtoken';

let app: Express;
let postId: string;
let commentIds: string[] = [];

beforeAll(async () => {
  app = await initApp();
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});

  const registerResponse = await request(app).post('/auth/register').send({
    username: userData.username,
    email: userData.email,
    password: userData.password,
  });
  userData.token = registerResponse.body.token;
  const decoded = jwt.decode(userData.token) as { _id: string };
  userData._id = decoded._id;

  const postResponse = await request(app)
    .post('/post')
    .set('Authorization', 'Bearer ' + userData.token)
    .send(postsList[0]);
  postId = postResponse.body._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
});

describe('Test Comment Suite', () => {
  test('Test add comment without token fails', async () => {
    const response = await request(app)
      .post('/comment')
      .send({ postId, content: commentsList[0].content });
    expect(response.status).toBe(401);
  });

  test('Test add comment with token succeeds', async () => {
    const response = await request(app)
      .post('/comment')
      .set('Authorization', 'Bearer ' + userData.token)
      .send({ postId, content: commentsList[0].content });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    commentIds.push(response.body._id);
  });

  test('Test get all comments', async () => {
    const response = await request(app)
      .get('/comment')
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Test get comments by post ID', async () => {
    const response = await request(app)
      .get('/comment')
      .query({ postId })
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('Test get comment by ID', async () => {
    const response = await request(app)
      .get(`/comment/${commentIds[0]}`)
      .set('Authorization', 'Bearer ' + userData.token);
    expect(response.status).toBe(200);
    expect(response.body._id).toBe(commentIds[0]);
  });

  test('Test update comment succeeds', async () => {
    const response = await request(app)
      .put(`/comment/${commentIds[0]}`)
      .set('Authorization', 'Bearer ' + userData.token)
      .send({ content: 'Updated Comment' });
    expect(response.status).toBe(200);
    expect(response.body.content).toBe('Updated Comment');
  });

  test('Test delete comment succeeds', async () => {
    const addResponse = await request(app)
      .post('/comment')
      .set('Authorization', 'Bearer ' + userData.token)
      .send({ postId, content: commentsList[1].content });
    const commentId = addResponse.body._id;

    const deleteResponse = await request(app)
      .delete(`/comment/${commentId}`)
      .set('Authorization', 'Bearer ' + userData.token);
    expect(deleteResponse.status).toBe(200);
  });

  test('Test delete comment without token fails', async () => {
    const response = await request(app).delete(`/comment/${commentIds[0]}`);
    expect(response.status).toBe(401);
  });
});
