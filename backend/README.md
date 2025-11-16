# School Management System - Backend

This is the backend for the School Management System using MongoDB and Mongoose.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the backend directory with:
```
MONGODB_URL=mongodb://localhost:3000/
PORT=5000
```

3. Make sure MongoDB is running on your system

4. Start the backend:
```bash
npm start
```

## Features

- MongoDB connection with Mongoose
- Environment variable configuration
- Connection error handling
- Graceful shutdown handling
- Connection event logging

## Dependencies

- mongoose: MongoDB object modeling for Node.js
- dotenv: Loads environment variables from .env file
