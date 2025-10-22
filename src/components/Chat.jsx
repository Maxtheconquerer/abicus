import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Markdown message component similar to the working version
function MarkdownMessage({ content, isResponse }) {
  const renderCode = ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-gray-700 p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props}>
        {children}
      </code>
    );
  };

  const renderLink = (props) => {
    return (
      <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
        {props.children}
      </a>
    );
  };

  return (
    <div className="max-w-[600px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mb-2 mt-3">{children}</h3>,
          p: ({ children }) => <p className="mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-3">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          code: renderCode,
          a: renderLink,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-600 pl-4 my-3 italic">{children}</blockquote>
          ),
          hr: () => <hr className="my-4 border-gray-600" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function Chat() {
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentChatTitle, setCurrentChatTitle] = useState("Chat Assistant");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || isLoading) return;

    const messageText = messageInput;
    setMessageInput("");
    setIsLoading(true);

    // Add user message immediately
    const userMessage = {
      id: Math.random().toString(36).substring(2, 11),
      content: messageText,
      role: "user",
      created_at: new Date().toISOString(),
      type: "user",
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch("http://127.0.0.1:8001/api/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "9ef66e9a-e14b-4692-8244-a41d6fbff859",
          query: messageText,
          chat_id: "43282982",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream available");

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let streamedContent = "";
      let assistantMessageId = null;

      // Process streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let boundaryIndex;
        while ((boundaryIndex = buffer.indexOf("\n")) >= 0) {
          const chunk = buffer.slice(0, boundaryIndex).trim();
          buffer = buffer.slice(boundaryIndex + 1);

          if (chunk.startsWith("data:")) {
            try {
              const jsonString = chunk.slice(5).trim();
              const parsed = JSON.parse(jsonString);

              if (parsed.event === "content" && parsed.data?.content) {
                streamedContent += parsed.data.content;

                // Update or create assistant message
                setMessages((prev) => {
                  const newMessages = [...prev];
                  
                  // Find existing assistant message or create new one
                  const assistantIndex = newMessages.findIndex(
                    msg => msg.id === assistantMessageId && msg.role === "assistant"
                  );
                  
                  if (assistantIndex >= 0) {
                    // Update existing message
                    newMessages[assistantIndex] = {
                      ...newMessages[assistantIndex],
                      content: streamedContent,
                    };
                  } else {
                    // Create new assistant message
                    assistantMessageId = Math.random().toString(36).substring(2, 11);
                    const assistantMessage = {
                      id: assistantMessageId,
                      content: streamedContent,
                      role: "assistant",
                      created_at: new Date().toISOString(),
                      type: "assistant",
                    };
                    newMessages.push(assistantMessage);
                  }
                  
                  return newMessages;
                });
              }

              if (parsed.event === "complete" && parsed.data?.chat_title) {
                setCurrentChatTitle(parsed.data.chat_title);
              }
            } catch (err) {
              console.error("Failed to parse JSON chunk:", chunk, err);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 11),
        content: "Sorry, there was an error processing your message.",
        role: "assistant",
        created_at: new Date().toISOString(),
        type: "assistant",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-white">{currentChatTitle}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p className="text-lg mb-4">Start a new conversation</p>
              <p className="text-sm">Ask me anything about your documents</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.role === "user" 
                      ? "bg-blue-600 text-white max-w-[80%]" 
                      : "bg-gray-800 text-gray-200 max-w-[80%]"
                  }`}
                >
					<MarkdownMessage content={message.content} isResponse={message.role === "assistant"} />
                  {/* <MessageContent content={message.content} isResponse={message.role === "assistant"} /> */}
                  <div className="text-xs opacity-70 mt-2">
                    {formatTimestamp(message.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-200 rounded-lg px-4 py-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me anything about your notes..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={isLoading || !messageInput.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}