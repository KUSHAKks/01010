import React from 'react';
import { Bot } from 'lucide-react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-8">
      <div className="flex max-w-[85%]">
        {/* Avatar */}
        <div className="flex-shrink-0 mr-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
            <Bot size={18} className="text-white" />
          </div>
        </div>

        {/* Typing indicator */}
        <div className="bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl rounded-bl-md px-6 py-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">AI is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
};