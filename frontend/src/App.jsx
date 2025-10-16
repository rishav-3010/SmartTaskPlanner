import { useState, useEffect } from 'react'
import { Target, ListTodo, Clock, TrendingUp } from 'lucide-react'
import GoalInput from './components/GoalInput'
import TaskList from './components/TaskList'
import Timeline from './components/Timeline'
import DependencyGraph from './components/DependencyGraph'
import GoalsList from './components/GoalsList'
import axios from 'axios'
// At the top, after imports
axios.defaults.baseURL = import.meta.env.PROD 
  ? '/api'  // Production: use relative URL (Vercel routes to backend)
  : 'http://localhost:8000'  // Development: local backend


function App() {
  const [activeView, setActiveView] = useState('create') // create, tasks, timeline, graph
  const [currentGoal, setCurrentGoal] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState([])

  // Fetch all goals on mount
  useEffect(() => {
    fetchGoals()
  }, [])

const fetchGoals = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/goals/')  // Add full URL
    console.log('Goals API response:', response.data)  // Debug line
    setGoals(response.data)
  } catch (error) {
    console.error('Failed to fetch goals:', error)
    setGoals([])  // Set empty array on error
  }
}

  const handleGoalCreated = (goalData) => {
    setCurrentGoal(goalData.goal)
    setTasks(goalData.tasks)
    setActiveView('tasks')
    fetchGoals() // Refresh goals list
  }

  const handleGoalSelect = async (goalId) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/goals/${goalId}`)
      setCurrentGoal(response.data.goal)
      setTasks(response.data.tasks)
      setActiveView('tasks')
    } catch (error) {
      console.error('Failed to fetch goal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, {
        status: newStatus
      })
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ))
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Task Planner</h1>
                <p className="text-sm text-gray-500">AI-Powered Goal Breakdown</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveView('create')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'create' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                New Goal
              </button>
              {currentGoal && (
                <>
                  <button
                    onClick={() => setActiveView('tasks')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeView === 'tasks' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <ListTodo className="w-4 h-4 inline mr-1" />
                    Tasks
                  </button>
                  <button
                    onClick={() => setActiveView('timeline')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeView === 'timeline' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Timeline
                  </button>
                  <button
                    onClick={() => setActiveView('graph')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeView === 'graph' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Dependencies
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GoalInput onGoalCreated={handleGoalCreated} />
            </div>
            <div className="lg:col-span-1">
              <GoalsList 
                goals={goals} 
                onGoalSelect={handleGoalSelect}
                currentGoalId={currentGoal?.id}
              />
            </div>
          </div>
        )}

        {activeView === 'tasks' && currentGoal && (
          <div>
            {/* Goal Header */}
            <div className="card mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentGoal.title}
                  </h2>
                  <p className="text-gray-600 mb-4">{currentGoal.description}</p>
                  <div className="flex items-center space-x-6 text-sm">
                    {currentGoal.deadline && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Deadline: {new Date(currentGoal.deadline).toLocaleDateString()}
                      </div>
                    )}
                    {currentGoal.total_estimated_hours && (
                      <div className="flex items-center text-gray-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Est. {currentGoal.total_estimated_hours} hours
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <ListTodo className="w-4 h-4 mr-1" />
                      {tasks.length} tasks
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <TaskList 
              tasks={tasks} 
              onTaskUpdate={handleTaskUpdate}
            />
          </div>
        )}

        {activeView === 'timeline' && currentGoal && (
          <Timeline tasks={tasks} goal={currentGoal} />
        )}

        {activeView === 'graph' && currentGoal && (
          <DependencyGraph tasks={tasks} />
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App