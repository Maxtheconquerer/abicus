import { supabase } from "../../supabaseClient";

export class ChatService {
  async createChat(title) {
    const { data: chat, error } = await supabase
      .rpc('create_chat', {
        title_arg: title,
      });

    if (error) throw error;
    return chat;
  }

  async addMessage(
    chatId, 
    content, 
    role,
    tokensUsed,
    referencedNotes
  ) {
    const { data: message, error } = await supabase
      .rpc('add_message', {
        chat_id_arg: chatId,
        content_arg: content,
        role_arg: role,
        tokens_used_arg: tokensUsed,
        referenced_notes_arg: referencedNotes
      });

    if (error) throw error;
    return message;
  }

  async getChats() {
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return chats;
  }

  async getChatMessages(chatId) {
    const { data: messages, error } = await supabase
      .rpc('select_chat_messages', {
        chat_id_arg: chatId
      });

    if (error) throw error;
    return messages;
  }

  async deleteChat(chatId) {
    const { error } = await supabase
      .rpc('delete_chat', {
        chat_id_arg: chatId
      });

    if (error) throw error;
  }

  subscribeToMessages(chatId, callback) {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => callback(payload.new)
      )
      .subscribe();
  }
}

export const chatService = new ChatService();