export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  avatar_url?: string;
  default_model: string;
  temperature: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  system_prompt?: string;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  tokens: number;
  metadata_json?: string;
  created_at: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  context_window: number;
  description: string;
  is_available: boolean;
}

export interface FileAttachment {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  summary?: string;
  created_at: string;
}

export interface SystemPrompt {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  total_conversations: number;
  total_messages: number;
  total_files: number;
  total_tokens_used: number;
  total_requests: number;
}

export interface ProviderStatus {
  provider_name: string;
  is_configured: boolean;
  masked_key?: string;
  default_model: string;
  available_models: string[];
  status: 'active' | 'no_api_key' | 'degraded';
}
