"use client";

import { supabase } from "../../supabaseClient";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [userPlan, setUserPlan] = useState("free");

  const refreshChats = useCallback(async () => {
    const { data, error } = await supabase.rpc("select_user_chats");

    if (error) {
      console.error("Error fetching chats:", error.message);
    } else {
      setChats(data || []);
    }
  }, []);

  const createNewChat = useCallback(
    async (title) => {
      const { data: chatId, error } = await supabase.rpc("create_chat", {
        title_arg: title,
      });

      if (error) {
        throw error;
      }

      // Add initial AI message
      await supabase.rpc("add_message", {
        chat_id_arg: chatId,
        content_arg: "Hello! How can I help you with your notes?",
        role_arg: "assistant",
      });

      await refreshChats();
      return chatId;
    },
    [refreshChats]
  );

  const loadChatMessages = useCallback(
    async (chatId) => {
      const { data, error } = await supabase.rpc("select_chat_messages", {
        chat_id_arg: chatId,
      });

      if (error) {
        console.error("Error fetching messages:", error.message);
      } else {
        setMessages(data || []);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (content) => {
      if (!selectedChatId) return;

      try {
        const { data } = await supabase.auth.getUser();
        // Add user message
        await supabase.rpc("add_message", {
          chat_id_arg: selectedChatId,
          content_arg: content,
          role_arg: "user",
        });

        // Call the streaming API
        const response = await fetch("http://127.0.0.1:8001/api/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: "9ef66e9a-e14b-4692-8244-a41d6fbff859",
            query: content,
            chat_id: selectedChatId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream available");

        const decoder = new TextDecoder("utf-8");
        let buffer = ""; // Buffer to accumulate incomplete chunks
        let streamedContent = ""; // To store the assistant's final response
        let tokenUsage = null; // To store token usage data

        // Process streaming response
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode incoming data
          buffer += decoder.decode(value, { stream: true });

          // Process complete JSON objects from the buffer
          let boundaryIndex;
          while ((boundaryIndex = buffer.indexOf("\n")) >= 0) {
            const chunk = buffer.slice(0, boundaryIndex).trim();
            buffer = buffer.slice(boundaryIndex + 1); // Remove processed chunk

            if (chunk.startsWith("data:")) {
              try {
                const jsonString = chunk.slice(5).trim(); // Remove "data:" prefix
                const parsed = JSON.parse(jsonString);

                if (parsed.event === "content" && parsed.data?.content) {
                  streamedContent += parsed.data.content;

                  // Dynamically update assistant's message
                  setMessages((prev) => [
                    ...(prev[prev.length - 1]?.role === "assistant"
                      ? prev.slice(0, -1)
                      : prev), // Remove temp message if it exists
                    {
                      id: Math.random().toString(36).substring(2, 11),
                      content: streamedContent,
                      role: "assistant",
                      created_at: new Date().toISOString(),
                      type: "assistant",
                    },
                  ]);
                }

                if (parsed.event === "complete" && parsed.data?.chat_title) {
                  await supabase.rpc("update_chat_title", {
                    chat_id_arg: selectedChatId,
                    title_arg: parsed.data.chat_title,
                  });
                  await refreshChats();
                }

                if (parsed.event === "complete" && parsed.data?.token_usage) {
                  tokenUsage = parsed.data.token_usage;
                  console.log("Token usage:", tokenUsage); // Log token usage
                }
              } catch (err) {
                console.error("Failed to parse JSON chunk:", chunk, err);
              }
            }
          }
        }

        // Finalize the assistant's message in the database
        await supabase.rpc("add_message", {
          chat_id_arg: selectedChatId,
          content_arg: streamedContent,
          role_arg: "assistant",
        });

        // Update token usage in the database if available
        if (tokenUsage && userPlan !== "pro") {
          const { error } = await supabase.rpc("update_tokens_usage", {
            tokens_count: tokenUsage.total_tokens,
          });

          if (error) {
            throw new Error("TOKEN_LIMIT_EXCEEDED");
          }
        }
      } catch (error) {
        console.error("Error during streaming:", error);
        throw error;
      }
    },
    [selectedChatId, userPlan, refreshChats]
  );

  // Subscribe to message updates
  useEffect(() => {
    if (!selectedChatId) return;

    const subscription = supabase
      .channel(`chat:${selectedChatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${selectedChatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();     

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedChatId]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      loadChatMessages(selectedChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChatId, loadChatMessages]);

  // Initial load of chats
  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  return (
    <ChatContext.Provider
      value={{
        selectedChatId,
        chats,
        setChats,
        messages,
        setMessages,
        setSelectedChatId,
        refreshChats,
        createNewChat,
        sendMessage,
        loadChatMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook for using the chat context
export const useChat = () => useContext(ChatContext);
