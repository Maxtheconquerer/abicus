// src/components/Community.jsx
import { useState, useEffect } from 'react'
import { UploadInterface } from './UploadInterface' // Import the upload component
import { retrieveNotebooks, newNotebook } from '../supabase/retrieve_notebooks'
import { uploadSources } from '../supabase/sources'

export function Community({ onNavigateToLearningGames, showUploadModal, onCreateNotebook, onSelectNotebook, setActiveSection, onNotebookIdChange}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newNotebookTitle, setNewNotebookTitle] = useState('')
  const [NOTEBOOKID, setNotebookId] = useState('')

  // Notebooks data loaded from database
  const [notebooks, setNotebooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load notebooks from database on component mount
  useEffect(() => {
    const loadNotebooks = async () => {
      try {
        setLoading(true)
        const data = await retrieveNotebooks()
        setNotebooks(data || [])
      } catch (err) {
        console.error('Error loading notebooks:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadNotebooks()
  }, [])

  const updateNotebookId = (notebookId_) => {
    setNotebookId(notebookId_);
    onNotebookIdChange(notebookId_); 
  };

  const handleCreateNotebookClick = () => {
      const newNotebookId = onCreateNotebook()

      // setNotebookId(notebookId_)
      setNotebooks(prevNotebooks => [...prevNotebooks, newNotebook])
      
      // Navigate to LearningGames and open the upload modal
      onNavigateToLearningGames()
    }
  

  const handleNotebookClick = (notebook) => {
    console.log('Opening notebook:', notebook.title)
    console.log('NotebookId-Community.jsx', notebook.id)
    // Select the notebook and navigate to LearningGames without opening upload modal
    if (onSelectNotebook) {
      onSelectNotebook(notebook.id, notebook.title)
      setNotebookId(notebook.id);
    }
    // Navigate to LearningGames without opening the upload modal
    if (setActiveSection) {
      setActiveSection('learning-games')
    }
  }

  const handleSourcesUploaded = async (sources) => {
    // console.log("Received sources:", sources)
  
    // If you want to persist them in Supabase:
    // if (NOTEBOOKID) {
    //   uploadSources(sources, 'pdf', NOTEBOOKID)
    // }
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
              <UploadInterface onSourcesUploaded={handleSourcesUploaded} existingNotebookId={NOTEBOOKID}/>
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading notebooks...</h3>
          <p className="text-gray-600">Fetching your learning resources</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading notebooks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Notebooks Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.length > 0 ? (
            notebooks.map((notebook) => (
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
        ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notebooks yet</h3>
              <p className="text-gray-600 mb-4">Create your first notebook to get started</p>
            </div>
          )}
        </div>
      )}


    </div>
  )
}