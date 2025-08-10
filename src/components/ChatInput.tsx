import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, Smile, X, FileText, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  onStartListening: () => void;
  disabled?: boolean;
  isListening?: boolean;
  recognitionRef?: React.RefObject<SpeechRecognition>;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onStartListening,
  disabled, 
  isListening,
  recognitionRef 
}) => {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount and after sending
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachedFiles.length > 0) && !disabled) {
      onSendMessage(input.trim(), attachedFiles);
      setInput('');
      setAttachedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  }, [input, attachedFiles, onSendMessage, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
  }, []);

  const handleFileAttachment = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleVoiceInput = useCallback(() => {
    if (!recognitionRef?.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        
        // Auto-resize after voice input
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
          }
        }, 0);
      };
      
      onStartListening();
    }
  }, [isListening, onStartListening, recognitionRef]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={16} className="text-blue-500" />;
    }
    return <FileText size={16} className="text-gray-500" />;
  };

  const isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-2 sm:p-3 md:p-6 shadow-2xl fixed bottom-0 left-0 right-0 w-full max-w-full md:max-w-[2000px] mx-auto">
      <form onSubmit={handleSubmit} className="w-full max-w-full md:max-w-4xl mx-auto px-2 sm:px-4">
        <div className="relative">
          {/* File Attachments Display */}
          {attachedFiles.length > 0 && (
            <div className="mb-2 sm:mb-4 flex flex-wrap gap-1 sm:gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-2 sm:px-3 py-1 sm:py-2 border border-gray-200 dark:border-gray-700"
                >
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <X size={14} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Container */}
          <div className="flex items-end w-full gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={disabled}
                className="w-full resize-none rounded-xl sm:rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 sm:px-6 py-2 sm:py-4 pr-20 sm:pr-32 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              {/* Input Actions */}
              <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center space-x-1 sm:space-x-2">
                {/* Attachment button */}
                <button
                  type="button"
                  onClick={handleFileAttachment}
                  disabled={disabled}
                  className="p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Attach file"
                >
                  <Paperclip size={16} />
                </button>
                {/* Emoji button */}
                <button
                  type="button"
                  disabled={disabled}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title="Add emoji"
                >
                  <Smile size={16} />
                </button>
                {/* Voice input button */}
                {isVoiceSupported && (
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    disabled={disabled}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isListening 
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isListening ? "Stop listening" : "Voice input"}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
              </div>
            </div>
            {/* Send Button - always on the right */}
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Send"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
        />
        
        {/* Voice Listening Indicator */}
        {isListening && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full border border-red-200 dark:border-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Listening... Speak now</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-2 sm:mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-2">
          <button
            type="button"
            onClick={() => setInput("Explain quantum computing in simple terms")}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Explain quantum computing
          </button>
          <button
            type="button"
            onClick={() => setInput("Write a creative story")}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Write a story
          </button>
          <button
            type="button"
            onClick={() => setInput("Help me with coding")}
            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Help with coding
          </button>
        </div>
      </form>
    </div>
  );
};