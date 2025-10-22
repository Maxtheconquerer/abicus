import { useState, useEffect, useRef } from 'react'
import { supabase } from "../supabaseClient"
import { UploadInterface } from './components/UploadInterface'
import { LearningGames } from './components/LearningGames'
import { Community } from './components/Community'
import { Chat } from './components/Chat'
import { ChatProvider } from './supabase/chat_context' // Add this import
import { uploadSources } from './supabase/sources'

function App() {
  const [session, setSession] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [usersOnline, setUsersOnline] = useState([])
  const [activeSection, setActiveSection] = useState('community') // New state for navigation
  const [showUploadModal, setShowUploadModal] = useState(false)  
  const [currentNotebookId, setCurrentNotebookId] = useState(null) // Current active notebook ID
  const [currentNotebookName, setCurrentNotebookName] = useState('') // Current active notebook name
  const [notebooks, setNotebooks] = useState({}) // State for sources organized by notebook ID: {notebookId: [sources]}
  const [parentNotebookId, setParentNotebookId] = useState('');



  const handleNavigateToLearningGamesWithUpload = () => {
    setActiveSection('learning-games')
    setShowUploadModal(true)
  }

  const handleSourcesUploaded = (sources) => {
    if (currentNotebookId) {
      setNotebooks(prevNotebooks => ({
        ...prevNotebooks,
        [currentNotebookId]: [
          ...(prevNotebooks[currentNotebookId] || []),
          ...sources
        ]
      }))
    }

    // uploadSources(sources, 'pdf')

    setShowUploadModal(false) // Close the modal when sources are uploaded
  }

  const handleNotebookIdChange = (notebookId) => {
    setParentNotebookId(notebookId);
  };

  const createNewNotebook = () => {
    // const newNotebookId = `notebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // setCurrentNotebookId(newNotebookId)
    // setCurrentNotebookName('New Notebook')
    // setNotebooks(prevNotebooks => ({
    //   ...prevNotebooks,
    //   [newNotebookId]: []
    // }))
    // return newNotebookId
  }

  const handleNotebookCreation = (realNotebookId) => {
    setCurrentNotebookId(realNotebookId)
    setCurrentNotebookName('New Notebook')
    setNotebooks(prevNotebooks => ({
      ...prevNotebooks,
      [realNotebookId]: []
    }))
  }

  const selectNotebook = (notebookId, notebookName) => {
    console.log('NotebookId', notebookId)
    setCurrentNotebookId(notebookId)
    setCurrentNotebookName(notebookName || '')
    // Initialize empty sources array if notebook doesn't exist yet
    setNotebooks(prevNotebooks => ({
      ...prevNotebooks,
      [notebookId]: prevNotebooks[notebookId] || []
    }))
  }

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session)
  //   })
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session)
  //   })
  //   return () => subscription.unsubscribe()
  // }, [])

  // useEffect(() => {
  //   if (!session?.user) {
  //     setUsersOnline([]);
  //     return;
  //   } 
  // }, [session])

  // send message
  const sendMessage = async (e) => {
    e.preventDefault();

    supabase.channel("room_one").send({
      type: "broadcast",
      event: "message",
      payload: {
        message: newMessage,
        user_name: session?.user?.user_metadata?.email,
        avatar: session?.user?.user_metadata?.avatar_url,
        timestamp: new Date().toISOString(),
      },
    });
    setNewMessage("");
  };

  console.log(session)

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString("en-us", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // sign in 
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    })
  }

  const signOut = async () => {
    const {error} = await supabase.auth.signOut()
  }

  const renderMainContent = () => {
    switch (activeSection) {
      case 'upload-documents':
        return <UploadInterface />
      case 'learning-games':
        return <LearningGames 
        showUploadModal={showUploadModal}
        onCloseUploadModal={() => setShowUploadModal(false)}
        uploadedSources={currentNotebookId ? (notebooks[currentNotebookId] || []) : []}
        onSourcesUploaded={handleSourcesUploaded}
        onOpenUploadModal={() => setShowUploadModal(true)}
        notebookId={currentNotebookId}
        notebookName={currentNotebookName}
        onNotebookCreation={handleNotebookCreation}
      />
      case 'community':
        return <Community 
        onNavigateToLearningGames={handleNavigateToLearningGamesWithUpload} 
        setActiveSection={setActiveSection}
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
        onCreateNotebook={createNewNotebook}
        onSelectNotebook={selectNotebook}
        onNotebookIdChange={handleNotebookIdChange}
      />
      case 'chat':
        return (
          <ChatProvider>
            <Chat />
          </ChatProvider>
        )
      default:
        return <UploadInterface />
    }
  }

  // if (!session) {
  //   return (
  //     <div className="w-full flex h-screen justify-center items-center">
  //       <button onClick={signIn}>sign in with google</button>
  //     </div>
  //   )
  // } else {
    return (
      <div className="w-full flex h-screen justify-center items-center p-4">
        <div className="border-[1px] border-gray-700 max-w-9xl w-full min-h-[900px] rounded-lg flex">
          {/* Sidebar Navigation */}
          <div className="w-64 border-r-[1px] border-gray-700 flex flex-col">
            
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveSection('community')}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === 'community' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    🏠 Notebooks
                  </button>
                </li>
                {/* <li>
                  <button
                    onClick={() => setActiveSection('upload-documents')}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === 'upload-documents' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    📄 Upload Documents
                  </button>
                </li> */}
                <li>
                  <button
                    onClick={() => setActiveSection('chat')}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === 'chat' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    🎮 Chat
                  </button>
                </li>
              </ul>
            </nav>

            <div className="p-4 border-b-[1px] border-gray-700">
              <p className="text-sm text-gray-400">signed in as {session?.user?.user_metadata?.full_name}</p>
              <button onClick={signOut} className="mt-2 text-sm text-red-400 hover:text-red-300">
                sign out
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
    )
  }


export default App