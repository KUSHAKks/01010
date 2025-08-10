import React from 'react';
import { Moon, Sun, Trash2, MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onClearChat: () => void;
  messageCount: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isDarkMode, 
  onToggleTheme, 
  onClearChat, 
  messageCount 
}) => {
  const handleClearChat = () => {
    if (messageCount === 0) return;
    
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      onClearChat();
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageCircle className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              AI ChatBot
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Mistral AI
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? (
              <Sun size={20} className="text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <button
            onClick={handleClearChat}
            disabled={messageCount === 0}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 group"
            title="Clear chat history"
          >
            <Trash2 size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-red-500 dark:group-hover:text-red-400" />
          </button>
        </div>
      </div>
    </header>
  );
};