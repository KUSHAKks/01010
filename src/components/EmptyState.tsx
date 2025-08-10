import React from 'react';
import { MessageCircle, Sparkles, Zap, Shield, Mic, Volume2, Brain, Code, Lightbulb } from 'lucide-react';

export const EmptyState: React.FC = () => {
  const features = [
    {
      icon: <Sparkles className="text-blue-500" size={24} />,
      title: "Multiple AI Models",
      description: "Choose from GPT-4, Claude, Mistral and more"
    },
    {
      icon: <Zap className="text-green-500" size={24} />,
      title: "Real-time Chat",
      description: "Instant responses with markdown support"
    },
    {
      icon: <Mic className="text-purple-500" size={24} />,
      title: "Voice Input",
      description: "Speak your messages using voice recognition"
    },
    {
      icon: <Volume2 className="text-orange-500" size={24} />,
      title: "Text-to-Speech",
      description: "Listen to AI responses with voice synthesis"
    },
    {
      icon: <Shield className="text-red-500" size={24} />,
      title: "Local Storage",
      description: "Your conversations are saved locally"
    },
    {
      icon: <Brain className="text-indigo-500" size={24} />,
      title: "Smart Responses",
      description: "Context-aware AI conversations"
    }
  ];

  const quickStarters = [
    {
      icon: <Code className="text-blue-500" size={20} />,
      title: "Code Help",
      prompt: "Help me debug this JavaScript function",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Lightbulb className="text-yellow-500" size={20} />,
      title: "Creative Writing",
      prompt: "Write a short story about time travel",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Brain className="text-purple-500" size={20} />,
      title: "Explain Concepts",
      prompt: "Explain machine learning in simple terms",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <div className="flex items-start justify-center p-8">
      <div className="text-center max-w-4xl w-full">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <MessageCircle className="text-white" size={40} />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome to GPT AI
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the power of AI with multiple models, voice features, and advanced chat capabilities. 
            Start a conversation to unlock endless possibilities!
          </p>
        </div>

        {/* Quick Starters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Quick Starters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickStarters.map((starter, index) => (
              <button
                key={index}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${starter.gradient} text-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  {starter.icon}
                  <h3 className="font-semibold text-lg">{starter.title}</h3>
                </div>
                <p className="text-sm opacity-90 text-left">
                  "{starter.prompt}"
                </p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pro Tips - Now with proper spacing and visibility */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-8">
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-4 text-xl flex items-center justify-center space-x-2">
            <Sparkles size={24} />
            <span>Pro Tips</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span>Use <kbd className="px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-xs font-mono">Shift+Enter</kbd> for line breaks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
              <span>Click the microphone icon for voice input</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span>Use the speaker icon to hear responses aloud</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
              <span>Edit your last message by clicking the edit icon</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              <span>Export your conversations as markdown files</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
              <span>Switch between different AI models anytime</span>
            </div>
          </div>
        </div>

        {/* Additional content sections for demonstration */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                🚀 First Steps
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Choose your preferred AI model</li>
                <li>• Start with a simple question or task</li>
                <li>• Explore voice input and output features</li>
                <li>• Save important conversations</li>
              </ul>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                💡 Best Practices
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Be specific in your questions</li>
                <li>• Use context for better responses</li>
                <li>• Try different AI models for comparison</li>
                <li>• Export important conversations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Extra bottom padding to ensure content is accessible above input */}
        <div className="h-32"></div>
      </div>
    </div>
  );
};