import express from 'express';
import authRoutes from './routes/authRoute';
import postRoutes from './routes/postRoute';
import commentRoutes from './routes/commentRoute';
import userRoutes from './routes/userRoute';
import { swaggerUi, swaggerSpec } from './swagger';

const app = express();

app.use(express.json());


app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task 2 - API Documentation'
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/comment', commentRoutes);

export default app;
