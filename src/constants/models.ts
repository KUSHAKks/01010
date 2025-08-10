import { AIModel } from '../types/chat';

export const AI_MODELS: AIModel[] = [
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B',
    description: 'Fast and efficient model for general conversations'
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Balanced performance and speed'
  },
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    description: 'Most capable model for complex tasks'
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast and lightweight Claude model'
  },
  {
    id: 'anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    description: 'Balanced Claude model for most tasks'
  }
];