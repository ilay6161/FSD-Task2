import app from './app';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/default-db';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log('MongoDB connection error:', err));
