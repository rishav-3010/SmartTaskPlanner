import { Target, Calendar, Clock, ChevronRight } from 'lucide-react'

export default function GoalsList({ goals, onGoalSelect, currentGoalId }) {
  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverdue = (deadline) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-4">
        <Target className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No goals yet</p>
          <p className="text-xs text-gray-400 mt-1">Create your first goal to get started</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => onGoalSelect(goal.id)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                currentGoalId === goal.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate mb-1">
                    {goal.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                    {goal.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    {goal.deadline && (
                      <span className={`flex items-center ${
                        isOverdue(goal.deadline) ? 'text-red-600 font-medium' : ''
                      }`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(goal.deadline)}
                      </span>
                    )}
                    {goal.total_estimated_hours && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {goal.total_estimated_hours}h
                      </span>
                    )}
                  </div>
                </div>
                
                <ChevronRight className={`w-5 h-5 flex-shrink-0 ml-2 transition-colors ${
                  currentGoalId === goal.id ? 'text-primary-600' : 'text-gray-400'
                }`} />
              </div>
            </button>
          ))}
        </div>
      )}

      {goals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {goals.length} goal{goals.length !== 1 ? 's' : ''} created
          </p>
        </div>
      )}
    </div>
  )
}