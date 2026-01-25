import express from 'express';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';

const app = express();

app.use(express.json());

app.use('/post', postRoutes);

app.use('/comment', commentRoutes);

export default app;
