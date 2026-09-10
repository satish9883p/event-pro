# 🚀 Quick Start Guide - Event Pro – Event & Function Hall Booking Platform

## Get Started in 5 Minutes

### Prerequisites
- Node.js v16+ and npm
- MongoDB Atlas account
- Groq API key
- Git

---

## 📋 Step-by-Step Setup

### 1️⃣ Clone Repository
```bash
cd your-workspace
git clone <repository-url>
cd scalable-ai-event-management
```

### 2️⃣ Backend Setup (Terminal 1)
```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/event-management
# JWT_SECRET=your-strong-random-secret
# GROQ_API_KEY=your-groq-api-key

# Start server
npm run dev
```
✅ Backend running on: http://localhost:5000

### 3️⃣ Frontend Setup (Terminal 2)
```bash
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```
✅ Frontend running on: http://localhost:5173

---

## 🔑 Getting Required Keys

### MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Click "Connect" → "Drivers" → Copy connection string
5. Add to server/.env as MONGO_URI

### Groq API
1. Visit https://console.groq.com
2. Sign up (free tier available)
3. Generate API key
4. Add to server/.env as GROQ_API_KEY

---

## 🧪 Quick Test

### Create Test User
1. Go to http://localhost:5173/register
2. Register: testuser@example.com / password123

### Create Admin User (MongoDB)
```bash
# In MongoDB Atlas, add to User collection:
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$10$...", # bcrypt hash of "admin123"
  "role": "admin"
}
```

### Test Features
- ✅ Register at http://localhost:5173/register
- ✅ Browse events at http://localhost:5173/events
- ✅ View dashboard at http://localhost:5173/dashboard
- ✅ Try AI at http://localhost:5173/ai-assistant
- ✅ Admin panel at http://localhost:5173/admin (admin role only)

---

## 📱 Project Routes

### Public Routes
- `/` - Landing page
- `/login` - Login
- `/register` - Register
- `/events` - Browse events
- `/events/:id` - Event details

### Protected Routes (Login Required)
- `/dashboard` - User dashboard
- `/profile` - Profile settings
- `/ai-assistant` - Chat with AI

### Admin Routes (Admin Role Required)
- `/admin` - Admin dashboard
- `/admin/events/new` - Create event
- `/admin/events/:id` - Edit event

---

## 🔧 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Check MongoDB connection, verify MONGO_URI |
| **Port 5000 already in use** | `lsof -i :5000` to find process, or change PORT in .env |
| **Can't connect to MongoDB** | Verify IP whitelist in MongoDB Atlas |
| **Groq API errors** | Check API key validity and quota |
| **Frontend blank page** | Check browser console for errors |
| **CORS errors** | Verify CLIENT_URL in backend .env matches frontend URL |

---

## 🛠️ Development Tools

### Useful Commands

**Backend:**
```bash
npm run dev          # Development with auto-reload
npm start            # Production server
npm run seed         # Seed database with sample data
```

**Frontend:**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint code
```

---

## 📊 Database Models

The system automatically creates these MongoDB collections:

- **Users** - User accounts with auth
- **Events** - Event listings
- **Registrations** - Event registrations
- **Chats** - AI conversation history

---

## 🚀 Production Build

### Build Frontend
```bash
cd client
npm run build
# Creates optimized build in client/dist/
```

### Deploy Frontend to Vercel
```bash
npm install -g vercel
cd client
vercel
```

### Deploy Backend to Render
1. Push to GitHub
2. Connect repository to Render.com
3. Set environment variables
4. Auto-deploys on push

---

## 📚 API Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Get Events
```bash
curl http://localhost:5000/api/events?category=Technical&page=1
```

### Chat with AI
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What events are available?"
  }'
```

---

## 💡 Tips & Best Practices

✅ **Use environment variables** - Never hardcode secrets
✅ **Keep JWT secret strong** - At least 32 random characters
✅ **Enable MongoDB IP whitelist** - In MongoDB Atlas settings
✅ **Use HTTPS in production** - Critical for security
✅ **Monitor API rate limits** - Check Groq dashboard
✅ **Regular backups** - MongoDB Atlas auto-backups available
✅ **Test thoroughly** - Before production deployment

---

## 🆘 Getting Help

1. **Check README.md** - Comprehensive documentation
2. **Server logs** - `npm run dev` shows errors
3. **Browser console** - F12 for frontend errors
4. **MongoDB Atlas logs** - Check database connection
5. **Groq console** - Verify API quota and logs

---

## 🎉 You're Ready!

Your Event Pro platform is now running. Visit:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health check:** http://localhost:5000/health

**Happy coding! 🚀**
