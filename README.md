# 🎯 Smart Task Planner

An AI-powered task planning application that breaks down your goals into actionable tasks with intelligent timelines and dependency management using Google's Gemini AI.

🎥 Demo Video
Watch the full demo here: Smart Task Planner Demo

## ✨ Features

- **AI-Powered Task Breakdown**: Automatically generates detailed task lists from goal descriptions
- **Intelligent Scheduling**: AI suggests realistic timelines and dependencies
- **Visual Timeline**: See your tasks organized chronologically
- **Dependency Graph**: Visualize task relationships and execution order
- **Task Management**: Track status, priority, and progress
- **Real-time Updates**: Update task status with instant visual feedback
- **Multiple Views**: Switch between task list, timeline, and dependency views

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database with Beanie ODM
- **Google Gemini AI**: Advanced language model for task generation
- **Python 3.14**: Latest Python version

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful icon set
- **Axios**: HTTP client

## 📋 Prerequisites

- Python 3.14+
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Gemini API key

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-task-planner
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=smart_task_planner
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Start the Backend Server

```bash
cd backend
python -m app.main
```

The backend will start at `http://localhost:8000`
The frontend will start at `http://localhost:5173`

## 🔑 Getting API Keys

### Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

### MongoDB Setup

**Option 1: MongoDB Atlas (Cloud - Recommended)**
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace `<password>` with your database password

**Option 2: Local MongoDB**
```bash
# Default local connection
MONGODB_URL=mongodb://localhost:27017
```

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Create Goal with AI Task Generation
```http
POST /api/goals/
Content-Type: application/json

{
  "title": "Launch a product in 2 weeks",
  "description": "Build and launch a web application with authentication, database, and deployment",
  "deadline": "2025-11-01"
}
```

#### Get Goal with Tasks
```http
GET /api/goals/{goal_id}
```

#### Update Task Status
```http
PATCH /api/tasks/{task_id}/status
Content-Type: application/json

{
  "status": "in_progress"
}
```

## 🎨 Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── GoalInput.jsx        # Goal creation form
│   │   ├── GoalsList.jsx        # Sidebar with all goals
│   │   ├── TaskList.jsx         # Task display with stats
│   │   ├── Timeline.jsx         # Chronological timeline view
│   │   └── DependencyGraph.jsx  # Visual dependency flow
│   ├── App.jsx                  # Main application
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 💡 Usage Examples

### Example 1: Simple Goal
```json
{
  "title": "Learn React in 1 month",
  "description": "Master React fundamentals, hooks, and build 3 projects",
  "deadline": "2025-11-15"
}
```

### Example 2: Complex Project
```json
{
  "title": "Build E-commerce Platform",
  "description": "Create a full-stack e-commerce platform with user authentication, product catalog, shopping cart, payment integration, and admin dashboard. Tech stack: React, Node.js, MongoDB, Stripe",
  "deadline": "2025-12-31"
}
```

### Example 3: Learning Path
```json
{
  "title": "Master Machine Learning",
  "description": "Learn ML fundamentals, practice with datasets, build 5 ML projects covering supervised and unsupervised learning, neural networks, and deployment",
  "deadline": "2026-03-01"
}
```

## 🎯 Features Explained

### AI Task Generation
The system uses Google's Gemini AI to:
- Analyze your goal description
- Break it down into logical, sequential tasks
- Estimate time requirements
- Identify task dependencies
- Suggest realistic timelines
- Prioritize tasks based on importance

### Task Status Flow
```
Pending → In Progress → Completed
           ↓
        Blocked (if dependencies aren't met)
```

### Priority Levels
- **Low**: Nice to have, flexible timing
- **Medium**: Standard importance
- **High**: Important for project success
- **Critical**: Blocking other tasks, must be done first

### Dependency Management
- Tasks can depend on one or multiple other tasks
- Visual dependency graph shows execution flow
- System organizes tasks by dependency level
- Identifies root tasks (no dependencies) and leaf tasks (no dependents)

## 🔧 Configuration

### Backend Configuration (`backend/.env`)
```env
# Required
GEMINI_API_KEY=your_key_here
MONGODB_URL=mongodb://localhost:27017

# Optional (with defaults)
DATABASE_NAME=smart_task_planner
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### Frontend Configuration (`frontend/vite.config.js`)
The frontend proxies API calls to the backend:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  }
}
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `GEMINI_API_KEY not found`
```bash
# Solution: Ensure .env file exists and has the key
cd backend
cat .env  # Check if file exists
```

**Problem**: MongoDB connection failed
```bash
# Solution: Check MongoDB is running (local) or connection string is correct (Atlas)
# For local MongoDB:
mongod --version  # Verify MongoDB is installed
```

**Problem**: Python version warning about Pydantic
```bash
# This is a known warning with Python 3.14
# The app will still work correctly
# To suppress: Use Python 3.11 or 3.12 instead
```

### Frontend Issues

**Problem**: `npm install` fails
```bash
# Solution: Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Problem**: API calls failing
```bash
# Check backend is running on port 8000
# Check browser console for CORS errors
# Verify proxy configuration in vite.config.js
```

## 📊 Project Structure

```
smart-task-planner/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models.py            # Database models
│   │   ├── database.py          # MongoDB connection
│   │   ├── services/
│   │   │   ├── gemini_service.py   # AI integration
│   │   │   └── task_service.py     # Business logic
│   │   └── routes/
│   │       ├── goals.py         # Goal endpoints
│   │       └── tasks.py         # Task endpoints
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md
```

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Update environment variables on the platform
2. Set Python version to 3.11+ (if 3.14 causes issues)
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Set environment variable for API URL
3. Deploy the `dist` folder

### Environment Variables for Production

Backend:
```env
GEMINI_API_KEY=your_production_key
MONGODB_URL=your_atlas_connection_string
FRONTEND_URL=https://your-frontend-domain.com
ENVIRONMENT=production
```

## 📝 License

This project is created for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

## 🎥 Demo Video 

Record a demo showing:
1. Creating a goal
2. Viewing generated tasks
3. Updating task status
4. Viewing timeline
5. Viewing dependency graph

---

**Built with ❤️ using FastAPI, React, and Google Gemini AI**
