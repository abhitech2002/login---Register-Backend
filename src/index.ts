import express from "express";
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import {json, urlencoded} from 'body-parser'
import authRoutes from './routes/authRoutes';

// Load environment variables from .env file
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// middlewares
app.use(cors())
app.use(json())
app.use(urlencoded({extended: true}))

// Routes
app.use('/api/auth', authRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI || '').then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Database connection error:', err);
  });