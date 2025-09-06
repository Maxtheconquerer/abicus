// src/components/UploadInterface.jsx
import { useState } from 'react'

export function UploadInterface({ onSourcesUploaded }) {
  const [dragOver, setDragOver] = useState(false)
  const [sourcesCount, setSourcesCount] = useState(0)
  const [uploadedSources, setUploadedSources] = useState([])

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const processFiles = (files) => {
    const newSources = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      type: file.type,
      size: file.size,
      file: file
    }))
    
    setUploadedSources(prev => [...prev, ...newSources])
    setSourcesCount(prev => prev + files.length)
    
    // Call the callback to notify parent component
    if (onSourcesUploaded) {
      onSourcesUploaded([...uploadedSources, ...newSources])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    processFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    processFiles(files)
  }

  return (
    <div className="p-6 h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Add sources</h1>
          <p className="text-gray-400 mb-2">Sources let NotebookLM base its responses on the information that matters most to you.</p>
          <p className="text-gray-500 text-sm">(Examples: marketing plans, course reading, research notes, meeting transcripts, sales documents, etc.)</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
          Discover sources
        </button>
      </div>

      {/* Main Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors mb-8 ${
          dragOver 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Upload sources</h3>
          <p className="text-gray-400 mb-4">Drag & drop or <span className="text-blue-400 cursor-pointer hover:underline">choose file</span> to upload</p>
          <p className="text-gray-500 text-sm">Supported file types: PDF, .txt, Markdown, Audio (e.g. mp3)</p>
        </div>

        <input
          type="file"
          multiple
          accept=".pdf,.txt,.md,.mp3,.wav,.m4a"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors"
        >
          Choose Files
        </label>
      </div>

      {/* Alternative Source Input Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Google Drive */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.73 10.5l-2.5-4.33c.5-.87 1.5-1.17 2.5-.67l2.5 4.33-2.5 4.33c-1 .5-2 0-2.5-.87l2.5-4.33z"/>
                <path d="M16.27 10.5l2.5-4.33c.5-.87 1.5-1.17 2.5-.67l-2.5 4.33 2.5 4.33c1 .5 2 0 2.5-.87l-2.5-4.33z"/>
                <path d="M12 2l-2.5 4.33L12 10.5l2.5-4.17L12 2z"/>
                <path d="M12 13.5l-2.5 4.33L12 22l2.5-4.17L12 13.5z"/>
              </svg>
            </div>
            <h4 className="font-semibold text-white">Google Drive</h4>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9l-6-6z"/>
              </svg>
              <span className="text-white">Google Docs</span>
            </button>
            <button className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-orange-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 3h6l2 2h8l2-2h2v18H2V3zm4 2v12h12V5H6z"/>
              </svg>
              <span className="text-white">Google Slides</span>
            </button>
          </div>
        </div>

        {/* Link */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h4 className="font-semibold text-white">Link</h4>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
              <span className="text-white">Website</span>
            </button>
            <button className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-white">YouTube</span>
            </button>
          </div>
        </div>

        {/* Paste text */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h4 className="font-semibold text-white">Paste text</h4>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-white">Copied text</span>
            </button>
          </div>
        </div>
      </div>

      {/* Source Limit Indicator */}
      <div className="flex items-center">
        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="text-gray-400 mr-3">Source limit</span>
        <div className="flex-1 bg-gray-700 rounded-full h-2 mr-3">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(sourcesCount / 50) * 100}%` }}
          ></div>
        </div>
        <span className="text-gray-400">{sourcesCount}/50</span>
      </div>
    </div>
  )
}