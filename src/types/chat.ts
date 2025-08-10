export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isMarkdown?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isDarkMode: boolean;
  selectedModel: string;
  isListening: boolean;
  isSpeaking: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}