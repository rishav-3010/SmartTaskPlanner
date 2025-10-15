import { Network, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function DependencyGraph({ tasks }) {
  const [selectedTask, setSelectedTask] = useState(null)

  // Build dependency map
  const buildDependencyMap = () => {
    const taskMap = new Map()
    tasks.forEach(task => {
      taskMap.set(task.id, {
        ...task,
        dependents: [] // Tasks that depend on this task
      })
    })

    // Add dependents
    tasks.forEach(task => {
      task.dependencies.forEach(dep => {
        const parentTask = taskMap.get(dep.task_id)
        if (parentTask) {
          parentTask.dependents.push(task.id)
        }
      })
    })

    return taskMap
  }

  const dependencyMap = buildDependencyMap()

  // Find root tasks (no dependencies)
  const rootTasks = tasks.filter(task => task.dependencies.length === 0)
  
  // Find leaf tasks (no dependents)
  const leafTasks = tasks.filter(task => {
    const taskData = dependencyMap.get(task.id)
    return taskData && taskData.dependents.length === 0
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-500 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 border-blue-500 text-blue-800'
      case 'blocked':
        return 'bg-red-100 border-red-500 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />
      case 'in_progress':
        return <Circle className="w-4 h-4 fill-current" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  // Organize tasks by dependency level
  const organizeByLevel = () => {
    const levels = []
    const processed = new Set()
    const taskById = new Map(tasks.map(t => [t.id, t]))

    const getLevel = (task) => {
      if (task.dependencies.length === 0) return 0
      
      let maxParentLevel = -1
      for (const dep of task.dependencies) {
        const parent = taskById.get(dep.task_id)
        if (parent) {
          if (!processed.has(parent.id)) {
            getLevel(parent)
          }
          const parentLevel = levels.findIndex(level => 
            level.some(t => t.id === parent.id)
          )
          maxParentLevel = Math.max(maxParentLevel, parentLevel)
        }
      }
      
      return maxParentLevel + 1
    }

    tasks.forEach(task => {
      if (!processed.has(task.id)) {
        const level = getLevel(task)
        if (!levels[level]) levels[level] = []
        levels[level].push(task)
        processed.add(task.id)
      }
    })

    return levels
  }

  const levels = organizeByLevel()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Task Dependencies</h2>
            <p className="text-sm text-gray-600">
              Visualize task relationships and execution order
            </p>
          </div>
          <Network className="w-8 h-8 text-primary-600" />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Root Tasks</p>
              <p className="text-2xl font-bold text-purple-900">{rootTasks.length}</p>
              <p className="text-xs text-purple-600 mt-1">No dependencies</p>
            </div>
            <Circle className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Dependency Levels</p>
              <p className="text-2xl font-bold text-blue-900">{levels.length}</p>
              <p className="text-xs text-blue-600 mt-1">Execution phases</p>
            </div>
            <Network className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Leaf Tasks</p>
              <p className="text-2xl font-bold text-green-900">{leafTasks.length}</p>
              <p className="text-xs text-green-600 mt-1">No dependents</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Dependency Flow Visualization */}
      <div className="card overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Flow</h3>
        
        <div className="space-y-8 min-w-max">
          {levels.map((level, levelIndex) => (
            <div key={levelIndex} className="relative">
              {/* Level Label */}
              <div className="flex items-center mb-3">
                <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Level {levelIndex + 1}
                </div>
                <div className="ml-3 text-sm text-gray-500">
                  {levelIndex === 0 ? 'Start here' : `After Level ${levelIndex}`}
                </div>
              </div>

              {/* Tasks in this level */}
              <div className="flex flex-wrap gap-3">
                {level.map(task => {
                  const taskData = dependencyMap.get(task.id)
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-lg ${
                        getStatusColor(task.status)
                      } ${
                        selectedTask?.id === task.id ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                      }`}
                      style={{ minWidth: '200px', maxWidth: '250px' }}
                    >
                      <div className="flex items-start space-x-2">
                        {getStatusIcon(task.status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{task.title}</h4>
                          <p className="text-xs mt-1 opacity-75">
                            {task.estimated_hours}h • {task.priority}
                          </p>
                          {task.dependencies.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                              <p className="text-xs opacity-75">
                                ⬆️ {task.dependencies.length} dependencies
                              </p>
                            </div>
                          )}
                          {taskData && taskData.dependents.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs opacity-75">
                                ⬇️ {taskData.dependents.length} dependents
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Connector to next level */}
              {levelIndex < levels.length - 1 && (
                <div className="flex justify-center my-4">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-gray-300"></div>
                    <div className="text-gray-400 text-xl">↓</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Task Details */}
      {selectedTask && (
        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
            <button
              onClick={() => setSelectedTask(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-900">{selectedTask.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedTask.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium">{selectedTask.status.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <span className="ml-2 font-medium">{selectedTask.priority}</span>
              </div>
              <div>
                <span className="text-gray-500">Estimated:</span>
                <span className="ml-2 font-medium">{selectedTask.estimated_hours}h</span>
              </div>
            </div>

            {selectedTask.dependencies.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Depends On:</h5>
                <div className="space-y-1">
                  {selectedTask.dependencies.map(dep => (
                    <div key={dep.task_id} className="text-sm text-gray-600 pl-3 border-l-2 border-primary-300">
                      {dep.task_title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dependencyMap.get(selectedTask.id)?.dependents.length > 0 && (
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Required By:</h5>
                <div className="space-y-1">
                  {dependencyMap.get(selectedTask.id).dependents.map(depId => {
                    const depTask = tasks.find(t => t.id === depId)
                    return depTask ? (
                      <div key={depId} className="text-sm text-gray-600 pl-3 border-l-2 border-primary-300">
                        {depTask.title}
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Critical Path Warning */}
      {rootTasks.length === 0 && tasks.length > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Circular Dependency Detected</h4>
              <p className="text-sm text-yellow-700 mt-1">
                All tasks have dependencies. There should be at least one task without dependencies to start the workflow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}