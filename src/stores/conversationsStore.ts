import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { ChatMessage, Conversation } from '../types/app'; // Import both types

import mockData from '../mock-data';
import { generateId, getCurrentIsoDate } from './utils';

interface ConversationsState {
  conversations: Conversation[];
  // Actions for managing conversations
  addConversation: (
    driverId: string,
    initialMessages?: ChatMessage[]
  ) => Conversation;
  getConversationById: (id: string) => Conversation | undefined;
  updateConversation: (
    conversationId: string,
    updates: Partial<Omit<Conversation, 'id' | 'messages'>> // Cannot update ID or messages directly via this
  ) => void;
  deleteConversation: (conversationId: string) => void;

  // Actions for managing messages within a specific conversation
  addMessageToConversation: (
    conversationId: string,
    newMessageData: Omit<ChatMessage, 'id' | 'timestamp'> // ID and timestamp are generated
  ) => ChatMessage | undefined;
  updateMessageInConversation: (
    conversationId: string,
    messageId: string,
    updates: Partial<Omit<ChatMessage, 'id' | 'timestamp'>>
  ) => void;
  deleteMessageFromConversation: (
    conversationId: string,
    messageId: string
  ) => void;
}

export const useConversationsStore = create<ConversationsState>()(
  devtools(
    immer((set, get) => ({
      conversations: mockData.driverConversations as Conversation[],

      // Conversation Actions

      addConversation: (driverId, initialMessages = []) => {
        const newConversation: Conversation = {
          id: driverId,
          driverId,
          messages: initialMessages.map(msg => ({
            ...msg,
            id: msg.id ?? generateId(),
            timestamp: msg.timestamp ?? getCurrentIsoDate(),
          })),
        };
        set(state => {
          state.conversations.push(newConversation);
        });
        return newConversation;
      },

      getConversationById: id => {
        return get().conversations.find(conv => conv.id === id);
      },

      updateConversation: (conversationId, updates) => {
        set(state => {
          const conversation = state.conversations.find(
            conv => conv.id === conversationId
          );
          if (conversation) {
            // Merge updates, ensuring 'messages' and 'id' are not overwritten
            Object.assign(conversation, updates);
          }
        });
      },

      deleteConversation: conversationId => {
        set(state => {
          state.conversations = state.conversations.filter(
            conv => conv.id !== conversationId
          );
        });
      },

      // Message Actions (within a specific conversation)

      addMessageToConversation: (conversationId, newMessageData) => {
        let addedMessage: ChatMessage | undefined;
        set(state => {
          const conversation = state.conversations.find(
            conv => conv.id === conversationId
          );
          if (conversation) {
            const message: ChatMessage = {
              ...newMessageData,
              id: generateId(),
              timestamp: getCurrentIsoDate(), // Always generate timestamp on add
            };
            conversation.messages.push(message);
            addedMessage = message;
          }
        });
        return addedMessage;
      },

      updateMessageInConversation: (conversationId, messageId, updates) => {
        set(state => {
          const conversation = state.conversations.find(
            conv => conv.id === conversationId
          );
          if (conversation) {
            const message = conversation.messages.find(
              msg => msg.id === messageId
            );
            if (message) {
              // Merge updates, ensuring 'id' and 'timestamp' are not overwritten
              Object.assign(message, updates);
            }
          }
        });
      },

      deleteMessageFromConversation: (conversationId, messageId) => {
        set(state => {
          const conversation = state.conversations.find(
            conv => conv.id === conversationId
          );
          if (conversation) {
            conversation.messages = conversation.messages.filter(
              msg => msg.id !== messageId
            );
          }
        });
      },
    })),
    { name: 'ConversationsStore' }
  )
);
