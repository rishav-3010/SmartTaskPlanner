import { useState } from 'react'
import { Target, Calendar, FileText, Sparkles, AlertCircle } from 'lucide-react'
import axios from 'axios'

export default function GoalInput({ onGoalCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await axios.post('/api/goals/', {
        title,
        description,
        deadline: deadline || null
      })

      if (response.data.success) {
        onGoalCreated(response.data)
        // Clear form
        setTitle('')
        setDescription('')
        setDeadline('')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create goal. Please try again.')
      console.error('Error creating goal:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-primary-100 p-2 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Create Your Goal</h2>
          <p className="text-sm text-gray-500">AI will break it down into actionable tasks</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Target className="w-4 h-4 mr-1" />
            Goal Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Launch a product in 2 weeks"
            className="input-field"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-1" />
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your goal in detail. The more specific you are, the better the AI can help..."
            className="input-field min-h-32 resize-y"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Be specific about what you want to achieve, any constraints, and your expected outcome.
          </p>
        </div>

        {/* Deadline Input */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            Deadline (Optional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="input-field"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating Tasks...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Task Plan</span>
            </>
          )}
        </button>
      </form>

      {/* Tips Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">💡 Tips for better results:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be specific about your goal and expected outcomes</li>
          <li>• Mention any constraints (time, resources, skills)</li>
          <li>• Include context about your current situation</li>
          <li>• Set a realistic deadline to help with task scheduling</li>
        </ul>
      </div>
    </div>
  )
}