// src/components/Community.jsx
import { useState } from 'react'
import { UploadInterface } from './UploadInterface' // Import the upload component

export function Community({ onNavigateToLearningGames, showUploadModal }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNotebookTitle, setNewNotebookTitle] = useState('')

  // Sample notebooks data
  const [notebooks, setNotebooks] = useState([
    {
      id: 1,
      title: "AI-Powered Recommendations",
      description: "Advanced AI algorithms and machine learning techniques",
      emoji: "🤖",
      sources: 13,
      members: 245,
      dateCreated: "Sep 6, 2025",
      isPublic: true
    },
    {
      id: 2,
      title: "React Development",
      description: "Modern React patterns, hooks, and best practices",
      emoji: "⚛️",
      sources: 8,
      members: 142,
      dateCreated: "Sep 5, 2025",
      isPublic: true
    },
    {
      id: 3,
      title: "Machine Learning Basics",
      description: "Introduction to ML algorithms and data science",
      emoji: "🧠",
      sources: 21,
      members: 189,
      dateCreated: "Sep 4, 2025",
      isPublic: false
    },
    {
      id: 4,
      title: "Web Design Principles",
      description: "UI/UX design fundamentals and modern trends",
      emoji: "🎨",
      sources: 15,
      members: 97,
      dateCreated: "Sep 3, 2025",
      isPublic: true
    }
  ])

  const handleCreateNotebookClick = () => {
      onNavigateToLearningGames()
    }
  
  // Keep the modal version for backward compatibility
  const handleCreateNotebook = () => {
    if (newNotebookTitle.trim()) {
      const newNotebook = {
        id: notebooks.length + 1,
        title: newNotebookTitle,
        description: "New notebook for collaborative learning",
        emoji: "📚",
        sources: 0,
        members: 1,
        dateCreated: new Date().toLocaleDateString(),
        isPublic: true
      }
      setNotebooks([...notebooks, newNotebook])
      setNewNotebookTitle('')
      setShowCreateModal(false)
    }
  }

  const handleNotebookClick = (notebook) => {
    console.log('Opening notebook:', notebook.title)
    // Here you would navigate to the specific notebook
  }

  return (
    <div className="p-6 h-full bg-white">

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Upload Sources for Your Notebook</h2>
              <button
                onClick={onCloseUploadModal}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Use UploadInterface component inside modal */}
            <div className="bg-gray-800 rounded-lg p-6">
              <UploadInterface />
            </div>
          </div>
        </div>
      )}


      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Notebooks</h1>
          <p className="text-gray-600">Discover and create shared learning resources</p>
        </div>
        <button
          onClick={handleCreateNotebookClick} // Changed from setShowCreateModal(true)
          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Create Notebook
        </button>
      </div>

      {/* Notebooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notebooks.map((notebook) => (
          <div
            key={notebook.id}
            onClick={() => handleNotebookClick(notebook)}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
          >
            {/* Notebook Icon and Menu */}
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl">{notebook.emoji}</div>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Notebook Title */}
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{notebook.title}</h3>
            
            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{notebook.description}</p>

            {/* Stats */}
            <div className="flex justify-between items-center text-sm text-gray-400 mb-3">
              <span>{notebook.dateCreated}</span>
              <div className="flex items-center space-x-4">
                <span>{notebook.sources} sources</span>
                <span>{notebook.members} members</span>
              </div>
            </div>

            {/* Visibility Badge */}
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs ${
                notebook.isPublic 
                  ? 'bg-green-600 text-green-100' 
                  : 'bg-yellow-600 text-yellow-100'
              }`}>
                {notebook.isPublic ? 'Public' : 'Private'}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>


    </div>
  )
}