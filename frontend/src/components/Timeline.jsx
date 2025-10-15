import { Calendar, Clock, CheckCircle2, Circle } from 'lucide-react'

export default function Timeline({ tasks, goal }) {
  // Sort tasks by start date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.start_date) return 1
    if (!b.start_date) return -1
    return new Date(a.start_date) - new Date(b.start_date)
  })

  // Calculate timeline boundaries
  const dates = tasks
    .filter(t => t.start_date)
    .map(t => new Date(t.start_date))
  
  const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : new Date()
  const maxDate = goal.deadline 
    ? new Date(goal.deadline) 
    : dates.length > 0 
      ? new Date(Math.max(...dates.map(t => new Date(t.end_date || t.start_date))))
      : new Date()

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'blocked':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500'
      case 'high':
        return 'border-orange-500'
      case 'medium':
        return 'border-yellow-500'
      default:
        return 'border-gray-300'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDaysBetween = (date1, date2) => {
    const diff = Math.abs(new Date(date2) - new Date(date1))
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Project Timeline</h2>
            <p className="text-sm text-gray-600">
              {formatDate(minDate)} - {formatDate(maxDate)}
              {' '}({getDaysBetween(minDate, maxDate)} days)
            </p>
          </div>
          <Calendar className="w-8 h-8 text-primary-600" />
        </div>
      </div>

      {/* Timeline View */}
      <div className="card">
        <div className="space-y-6">
          {sortedTasks.map((task, index) => (
            <div key={task.id} className="relative">
              {/* Timeline connector */}
              {index < sortedTasks.length - 1 && (
                <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-200 z-0"></div>
              )}

              <div className="flex items-start space-x-4 relative z-10">
                {/* Status dot */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getStatusColor(task.status)} flex items-center justify-center mt-1`}>
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Task card */}
                <div className={`flex-1 bg-white border-l-4 ${getPriorityColor(task.priority)} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <span className={`badge ${
                      task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {task.start_date && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        <span>Start: {formatDate(task.start_date)}</span>
                      </div>
                    )}
                    {task.end_date && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        <span>End: {formatDate(task.end_date)}</span>
                      </div>
                    )}
                    {task.estimated_hours && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        <span>{task.estimated_hours}h estimated</span>
                      </div>
                    )}
                    {task.start_date && task.end_date && (
                      <div className="flex items-center text-primary-600 font-medium">
                        📊 {getDaysBetween(task.start_date, task.end_date)} days
                      </div>
                    )}
                  </div>

                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Dependencies:</span>{' '}
                        {task.dependencies.map(d => d.task_title).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tasks with dates available</p>
          </div>
        )}
      </div>

      {/* Timeline Legend */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Blocked</span>
          </div>
        </div>
      </div>
    </div>
  )
}