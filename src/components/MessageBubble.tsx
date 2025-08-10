import React, { useState } from 'react';
import { Copy, Check, User, Bot, Volume2, VolumeX, Edit3, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message } from '../types/chat';
import { marked } from 'marked';

interface MessageBubbleProps {
  message: Message;
  isLastUserMessage?: boolean;
  isSpeaking?: boolean;
  isTypewriting?: boolean;
  typewriterText?: string;
  onCopy: (content: string, isMarkdown?: boolean) => Promise<boolean>;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
  onEdit?: (content: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLastUserMessage,
  isSpeaking,
  isTypewriting,
  typewriterText,
  onCopy, 
  onSpeak,
  onStopSpeaking,
  onEdit 
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = async () => {
    const contentToCopy = isTypewriting && typewriterText ? typewriterText : message.content;
    const success = await onCopy(contentToCopy, message.isMarkdown);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      onStopSpeaking();
    } else {
      const contentToSpeak = isTypewriting && typewriterText ? typewriterText : message.content;
      const textToSpeak = message.isMarkdown ? 
        contentToSpeak.replace(/[#*`_~\[\]()]/g, '').replace(/\n+/g, ' ').trim() : 
        contentToSpeak;
      onSpeak(textToSpeak);
    }
  };

  const handleEdit = () => {
    if (isEditing && onEdit) {
      onEdit(editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          rows={3}
          autoFocus
        />
      );
    }

    // Show typewriter text for assistant messages that are currently being typed
    const contentToShow = (message.role === 'assistant' && isTypewriting && typewriterText) 
      ? typewriterText 
      : message.content;

    if (message.isMarkdown && contentToShow) {
      return (
        <div className="relative">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert prose-blue prose-headings:text-gray-900 dark:prose-headings:text-gray-100"
            dangerouslySetInnerHTML={{ 
              __html: marked(contentToShow, { 
                breaks: true,
                gfm: true 
              }) 
            }}
          />
          {/* Typewriter cursor */}
          {message.role === 'assistant' && isTypewriting && (
            <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
          )}
        </div>
      );
    }
    
    return (
      <div className="relative">
        <p className="whitespace-pre-wrap leading-relaxed">{contentToShow}</p>
        {/* Typewriter cursor for non-markdown content */}
        {message.role === 'assistant' && isTypewriting && (
          <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse ml-1"></span>
        )}
      </div>
    );
  };

  return (
    <div className={`flex mb-8 ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-4' : 'mr-4'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
            message.role === 'user' 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
              : 'bg-gradient-to-br from-green-500 to-green-600'
          }`}>
            {message.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`relative ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className={`rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
            message.role === 'user'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
              : 'bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 rounded-bl-md'
          }`}>
            {renderContent()}
            
            {/* Action buttons */}
            <div className={`absolute ${message.role === 'user' ? '-left-3' : '-right-3'} top-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col space-y-1`}>
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-110"
                title="Copy message"
              >
                {copied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} className="text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {/* Speak button for assistant messages */}
              {message.role === 'assistant' && (
                <button
                  onClick={handleSpeak}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-110"
                  title={isSpeaking ? "Stop speaking" : "Read aloud"}
                >
                  {isSpeaking ? (
                    <VolumeX size={14} className="text-red-500" />
                  ) : (
                    <Volume2 size={14} className="text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              )}

              {/* Edit button for last user message */}
              {message.role === 'user' && isLastUserMessage && onEdit && (
                <button
                  onClick={handleEdit}
                  className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-110"
                  title={isEditing ? "Save edit" : "Edit message"}
                >
                  <Edit3 size={14} className="text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>
          
          {/* Message Footer */}
          <div className={`flex items-center mt-2 space-x-3 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}>
            {/* Timestamp */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(message.timestamp)}
            </div>
            
            {/* Like/Dislike for assistant messages */}
            {message.role === 'assistant' && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => setLiked(liked === true ? null : true)}
                  className={`p-1 rounded transition-colors duration-200 ${
                    liked === true ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                  }`}
                  title="Like response"
                >
                  <ThumbsUp size={12} />
                </button>
                <button
                  onClick={() => setLiked(liked === false ? null : false)}
                  className={`p-1 rounded transition-colors duration-200 ${
                    liked === false ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                  title="Dislike response"
                >
                  <ThumbsDown size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};