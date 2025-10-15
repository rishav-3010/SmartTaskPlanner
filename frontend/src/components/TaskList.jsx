import { Clock, AlertCircle, CheckCircle2, Circle, Pause, Link2 } from 'lucide-react'

export default function TaskList({ tasks, onTaskUpdate }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'in_progress':
        return <Circle className="w-5 h-5 text-blue-600 fill-blue-600" />
      case 'blocked':
        return <Pause className="w-5 h-5 text-red-600" />
      default:
        return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      blocked: 'bg-red-100 text-red-700'
    }
    return badges[status] || badges.pending
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    }
    return badges[priority] || badges.medium
  }

  const handleStatusChange = (taskId, currentStatus) => {
    const statuses = ['pending', 'in_progress', 'completed', 'blocked']
    const currentIndex = statuses.indexOf(currentStatus)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    onTaskUpdate(taskId, nextStatus)
  }

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Calculate statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    totalHours: tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
  }

  const completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Circle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Hours</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalHours}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-primary-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`card hover:shadow-md transition-all duration-200 ${
              task.status === 'completed' ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-start space-x-4">
              {/* Status Icon */}
              <button
                onClick={() => handleStatusChange(task.id, task.status)}
                className="flex-shrink-0 mt-1 hover:scale-110 transition-transform"
                title="Click to change status"
              >
                {getStatusIcon(task.status)}
              </button>

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className={`font-semibold text-gray-900 mb-1 ${
                      task.status === 'completed' ? 'line-through text-gray-500' : ''
                    }`}>
                      {index + 1}. {task.title}
                    </h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>

                {/* Badges and Info */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`badge ${getStatusBadge(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  <span className={`badge ${getPriorityBadge(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  {task.estimated_hours && (
                    <span className="badge bg-purple-100 text-purple-700">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {task.estimated_hours}h
                    </span>
                  )}
                  {task.start_date && (
                    <span className="text-xs text-gray-500">
                      📅 {new Date(task.start_date).toLocaleDateString()}
                      {task.end_date && ` - ${new Date(task.end_date).toLocaleDateString()}`}
                    </span>
                  )}
                </div>

                {/* Dependencies */}
                {task.dependencies && task.dependencies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-start space-x-2">
                      <Link2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Depends on:</span>{' '}
                        {task.dependencies.map((dep, i) => (
                          <span key={dep.task_id}>
                            {dep.task_title}
                            {i < task.dependencies.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="card text-center py-12">
          <Circle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tasks yet. Create a goal to get started!</p>
        </div>
      )}
    </div>
  )
}