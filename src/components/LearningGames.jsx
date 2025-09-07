// src/components/LearningGames.jsx
import { useState, useEffect } from 'react'
import { UploadInterface } from './UploadInterface' // Import the upload component
import { retrieveSources } from '../supabase/sources'

export function LearningGames({ showUploadModal, onCloseUploadModal, uploadedSources, onSourcesUploaded, onOpenUploadModal, notebookId, notebookName }) {
  const [selectedTab, setSelectedTab] = useState('sources')
  const [quizTopic, setQuizTopic] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sourcesFromDb, setSourcesFromDb] = useState([])
  const [sourcesLength, setSourcesLength] = useState(0)
  const [notebookId__, setNotebookId] = useState('')

  useEffect(() => {
    if (notebookId) { 
      loadPage()
  }
  }, [notebookId, uploadedSources, notebookId__])

  const loadPage = async() => {
    // If we have a new notebook ID from upload, use that
    if (notebookId__) {
      console.log('Searching Table', notebookId__)
      setNotebookId(notebookId__)
      const sourcesDB = await retrieveSources(notebookId__)
      console.log('SourcesfromDB', sourcesDB)
      setSourcesFromDb(sourcesDB)
      setSourcesLength(sourcesDB.length)
    } 
    // Otherwise, use the original notebookId prop (for navigation)
    else if (notebookId) {
      console.log('Searching Table', notebookId)
      setNotebookId(notebookId)
      const sourcesDB = await retrieveSources(notebookId)
      console.log('SourcesfromDB', sourcesDB)
      setSourcesFromDb(sourcesDB)
      setSourcesLength(sourcesDB.length)
    }
  }
    

  const changeNotebookId = async(notebook) => {
    setNotebookId(notebook)
  }

  const tabs = [
    { id: 'sources', label: 'Sources', active: true },
    { id: 'quiz', label: 'Quiz', active: false },
    { id: 'flashcards', label: 'Flash-Card', active: false },
    { id: 'settings', label: 'Settings', active: false }
  ]

  const handleCreateQuiz = () => {
    if (quizTopic.trim()) {
      console.log('Creating quiz for topic:', quizTopic)
      // Here you would implement the quiz creation logic
    }
  }

  return (
    <div className="p-6 h-full max-w-4xl mx-auto relative">
      
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
              <UploadInterface onSourcesUploaded={onSourcesUploaded} existingNotebookId={notebookId__} onNotebookCreation={changeNotebookId}/>
            </div>
          </div>
        </div>
      )}

      {/* Header with Name */}
      <div className="flex items-center mb-8">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={notebookName || "Select a notebook"}
            className="w-full bg-gray-800 text-white text-lg font-medium px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            readOnly
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-6 mb-8 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sources Content */}
      {selectedTab === 'sources' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Sources ({sourcesLength})
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={onOpenUploadModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                + Add
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                Discover
              </button>
            </div>
          </div>
          
          {notebookId && sourcesFromDb.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 mb-4">
                <input 
                  type="checkbox" 
                  id="select-all"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="select-all" className="text-gray-300">Select all sources</label>
              </div>
              
              {sourcesFromDb.map((source) => (
                <div key={source.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      source.type === 'PDF' ? 'bg-orange-500' :
                      source.type === 'YouTube' ? 'bg-red-500' :
                      source.type === 'Website' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {source.type === 'PDF' ? (
                        <span className="text-white text-xs font-bold">PDF</span>
                      ) : source.type === 'YouTube' ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      ) : source.type === 'Website' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                      ) : (
                        <span className="text-white text-xs font-bold">?</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{source.name}</p>
                      <p className="text-gray-400 text-sm">
                        {source.type === 'PDF' && source.size ? 
                          `${(source.size / 1024 / 1024).toFixed(2)} MB` : 
                          source.type
                        }
                      </p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    defaultChecked
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {!notebookId ? 'No notebook selected' : 'No sources uploaded yet'}
              </h3>
              <p className="text-gray-400 mb-4">
                {!notebookId ? 'Create a new notebook to get started' : 'Upload documents to get started with your learning games'}
              </p>
              {notebookId && (
                <button 
                  onClick={onOpenUploadModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Upload Sources
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quiz Content */}
      {selectedTab === 'quiz' && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Create Quiz for Your Topic
          </h2>
          
          <p className="text-gray-600 mb-8">
            Click button below to create quiz for this topic
          </p>

          {/* Topic Input */}
          <div className="mb-6 max-w-md mx-auto">
            <input
              type="text"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              placeholder="Enter topic name (e.g., React Components)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-800"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateQuiz}
            disabled={!quizTopic.trim()}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Create Quiz and Flashcards
          </button>
        </div>
      )}

      {/* Flashcards Content */}
      {selectedTab === 'flashcards' && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Flash-Card
          </h2>
          <p className="text-gray-600">
            Your flashcards will appear here
          </p>
        </div>
      )}

      {/* Settings Content */}
      {selectedTab === 'settings' && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Settings
          </h2>
          <p className="text-gray-600">
            Your settings will appear here
          </p>
        </div>
      )}
    </div>
  )
}