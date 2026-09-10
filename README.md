# Event Pro – Event & Function Hall Booking Platform

## 📋 Project Abstract

Event Pro is a sophisticated web-based event and function hall booking platform built using the **MERN technology stack** (MongoDB, Express.js, React.js, Node.js) with hierarchical location discovery (State → District → Area), real-time slot scheduling, transparent price breakdown, and **AI-powered assistance** via Groq API.

The platform integrates:
- **Scalable architecture** for handling large numbers of events and users
- **AI Event Assistant** powered by Groq's llama-3.1-8b-instant model
- **JWT-based authentication** with role-based access control
- **Real-time registrations** with MongoDB persistence
- **Modern, responsive UI** with Tailwind CSS and Framer Motion animations

---

## 🌟 Key Features

### User Features
- ✅ **User Registration & Authentication** - Secure JWT-based auth
- ✅ **Browse & Search Events** - Powerful search and filtering
- ✅ **Event Registration** - Register/cancel event participation
- ✅ **View Event Details** - Comprehensive event information
- ✅ **Dashboard** - Track registrations and upcoming events
- ✅ **AI Assistant** - Ask questions about events and get smart answers
- ✅ **Profile Management** - Update personal information
- ✅ **Dark/Light Theme** - Flexible UI preferences

### Admin Features
- ✅ **Event Creation & Management** - Full CRUD operations
- ✅ **Event Publishing** - Control event visibility
- ✅ **Registration Management** - View and manage registrations
- ✅ **Admin Dashboard** - Statistics and analytics
- ✅ **Event Status Control** - Draft, Published, Completed, Cancelled

### Technical Features
- ✅ **AI-Powered Chat** - Natural language event queries
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **MongoDB Indexing** - Optimized queries
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Validation** - Input validation on frontend and backend

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18+** - UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Groq API** - AI integration

### Deployment Ready
- Support for **Vercel** (frontend)
- Support for **Render/Railway** (backend)
- **MongoDB Atlas** for cloud database

---

## 📁 Project Structure

```
scalable-ai-event-management/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/              (Reusable components)
│   │   │   ├── layout/              (Navbar, Footer)
│   │   │   ├── events/              (Event-related)
│   │   │   ├── chat/                (AI chat components)
│   │   │   └── dashboard/           (Dashboard components)
│   │   ├── pages/                   (Page components)
│   │   ├── context/                 (Auth, Theme, Chat context)
│   │   ├── hooks/                   (Custom React hooks)
│   │   ├── services/                (API services)
│   │   ├── utils/                   (Helpers, validators)
│   │   ├── routes/                  (Route protection)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── .gitignore
│
├── server/
│   ├── src/
│   │   ├── config/                  (Database, environment)
│   │   ├── controllers/             (Business logic)
│   │   ├── middleware/              (Auth, error, rate limit)
│   │   ├── models/                  (MongoDB schemas)
│   │   ├── routes/                  (API endpoints)
│   │   ├── services/                (Groq AI, event context)
│   │   ├── utils/                   (JWT, validators)
│   │   ├── app.js                   (Express app)
│   │   └── server.js                (Entry point)
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── README.md
└── .gitignore
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v16+ and **npm**
- **MongoDB Atlas** account (or local MongoDB)
- **Groq API Key** (free at https://console.groq.com)
- **Git**

### Step 1: Clone the Repository
```bash
cd path/to/your/workspace
git clone <repository-url>
cd scalable-ai-event-management
```

### Step 2: Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A strong random string
# - GROQ_API_KEY: Your Groq API key
# - CLIENT_URL: Frontend URL (default: http://localhost:5173)

# Start backend server
npm run dev
```

The backend server will start on `http://localhost:5000`

### Step 3: Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# The .env should contain:
# VITE_API_BASE_URL=http://localhost:5000/api

# Start frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 4: Access the Application

- **Landing Page**: http://localhost:5173/
- **User Registration**: http://localhost:5173/register
- **User Login**: http://localhost:5173/login
- **Browse Events**: http://localhost:5173/events
- **Dashboard**: http://localhost:5173/dashboard (requires login)
- **AI Assistant**: http://localhost:5173/ai-assistant (requires login)
- **Admin Dashboard**: http://localhost:5173/admin (requires admin role)

---

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/event-management
JWT_SECRET=your_super_strong_jwt_secret_here_change_this
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key_here
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AI_RATE_LIMIT_MAX_REQUESTS=20
AUTH_RATE_LIMIT_MAX_REQUESTS=10
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📊 Database Setup

### MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Add it to `server/.env` as `MONGO_URI`

### Local MongoDB
```bash
# On Windows
mongod

# On Mac (with Homebrew)
brew services start mongodb-community

# Connection string
mongodb://localhost:27017/event-management
```

---

## 🤖 Groq API Setup

1. Visit https://console.groq.com
2. Sign up for a free account
3. Generate an API key
4. Add the key to `server/.env` as `GROQ_API_KEY`
5. The system uses model: `llama-3.1-8b-instant`

---

## 📡 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user (protected)
```

### User Endpoints
```
GET    /api/users/profile                - Get user profile (protected)
PUT    /api/users/profile                - Update profile (protected)
PUT    /api/users/change-password        - Change password (protected)
```

### Event Endpoints
```
GET    /api/events                       - Get all published events
GET    /api/events/:id                   - Get event details
POST   /api/events                       - Create event (admin only)
PUT    /api/events/:id                   - Update event (admin only)
DELETE /api/events/:id                   - Delete event (admin only)
PATCH  /api/events/:id/status            - Change event status (admin only)
```

### Registration Endpoints
```
POST   /api/registrations/:id/register       - Register for event (protected)
DELETE /api/registrations/:id/register       - Cancel registration (protected)
GET    /api/registrations/my                 - Get my registrations (protected)
GET    /api/registrations/:id/registrations  - Get event registrations (admin only)
```

### AI Endpoints
```
POST   /api/ai/chat              - Send message to AI (protected, rate limited)
GET    /api/ai/history           - Get chat history (protected)
DELETE /api/ai/history           - Clear chat history (protected)
DELETE /api/ai/history/:id       - Delete specific message (protected)
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt with 10 salt rounds
- ✅ **Rate Limiting** - Prevents abuse and DDoS
- ✅ **CORS Protection** - Configured for frontend origin
- ✅ **Helmet.js** - HTTP security headers
- ✅ **Input Validation** - Both frontend and backend
- ✅ **Error Handling** - No stack traces in production
- ✅ **Environment Variables** - No secrets in code
- ✅ **MongoDB Validation** - Schema-level validation
- ✅ **Role-Based Access** - Admin vs User roles

---

## 🌐 User Roles

### User Role
- Browse published events
- Register/cancel registrations
- View event details
- Access personal dashboard
- Interact with AI assistant
- Manage profile

### Admin Role
- All user permissions plus:
- Create, edit, delete events
- Manage event status
- View all registrations
- Monitor participants
- Access admin dashboard

---

## 📱 Responsive Design

The application is fully responsive and works on:
- ✅ Mobile phones (< 640px)
- ✅ Tablets (640px - 1024px)
- ✅ Laptops (1024px - 1536px)
- ✅ Large screens (> 1536px)

---

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Dark Mode** - Dark/light theme toggle
- **Smooth Animations** - Framer Motion effects
- **Loading States** - Skeleton loaders and spinners
- **Error States** - Clear error messages
- **Empty States** - Helpful guidance when no data
- **Toast Notifications** - User feedback messages
- **Accessible** - Semantic HTML and ARIA labels

---

## 🚀 Production Build

### Frontend Build
```bash
cd client
npm run build
npm run preview  # Preview production build
```

Output: `client/dist/` directory

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel
```

### Deploy to Netlify
```bash
cd client
npm run build
# Then drag-and-drop dist/ folder to Netlify
```

---

## 🚀 Backend Deployment

### Deploy to Render
1. Push code to GitHub
2. Go to https://render.com
3. Connect repository
4. Set environment variables
5. Deploy

### Deploy to Railway
1. Connect GitHub repo
2. Add environment variables
3. Railway auto-deploys on push

### Environment Variables for Production
```
NODE_ENV=production
MONGO_URI=<production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
GROQ_API_KEY=<your-groq-key>
CLIENT_URL=<production-frontend-url>
```

---

## 🧪 Testing the Application

### Test User Flow
1. Register a new account
2. Browse events on /events
3. Click on an event to view details
4. Register for an event
5. Visit dashboard to see registrations
6. Try AI assistant on /ai-assistant
7. Ask "What events are available?"

### Test Admin Flow
1. Register an admin account (or modify user in MongoDB)
2. Visit /admin to access admin dashboard
3. Create a new event
4. Publish the event
5. View event registrations

---

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify MONGO_URI in .env
- Check port 5000 is available
- Run `npm install` if dependencies missing

### Frontend won't start
- Ensure backend is running on port 5000
- Check VITE_API_BASE_URL in .env
- Check port 5173 is available
- Clear `node_modules` and reinstall if issues persist

### Can't connect to MongoDB
- Verify internet connection
- Check MongoDB Atlas IP whitelist includes your IP
- Use VPN if corporate network
- Try local MongoDB instead

### AI responses not working
- Verify GROQ_API_KEY is valid
- Check Groq API is accessible
- Verify API key has sufficient quota
- Check rate limiting hasn't triggered

### Rate limiting issues
- Wait 15 minutes for rate limit to reset
- Adjust RATE_LIMIT_MAX_REQUESTS in backend .env
- Check server logs for detailed info

---

## 📦 npm Scripts

### Backend
```bash
npm run dev    # Start with nodemon
npm start      # Start production server
npm run seed   # Seed database with sample data
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 📈 Performance Optimizations

- **MongoDB Indexes** - Optimized for common queries
- **Pagination** - Efficient data loading
- **Lazy Loading** - React components load on demand
- **API Caching** - Reduces redundant requests
- **Image Optimization** - Tailwind CSS over large images
- **Bundle Size** - Minified production builds
- **Database Queries** - Lean select for performance

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/feature-name`
5. Create Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues, questions, or suggestions:
1. Check existing issues on GitHub
2. Create detailed issue reports
3. Include error messages and steps to reproduce

---

## 🎯 Future Enhancements

- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Calendar view for events
- [ ] Attendee attendance tracking
- [ ] Event feedback/ratings
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSockets)
- [ ] Event recommendations based on AI
- [ ] Integration with calendar apps

---

## ✨ Credits

Built with ❤️ using MERN stack and Groq AI

**Stack:** MongoDB • Express • React • Node.js • Groq API

---

**Last Updated:** 2024
**Version:** 1.0.0
#   e v e n t - m a n a g e m e n t - s y s t e m  
 #   e v e n t - p r o  
 