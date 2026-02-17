// Zhipu AI (智谱AI) types

export interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ZhipuChatRequest {
  model: string
  messages: ZhipuMessage[]
  temperature?: number
  top_p?: number
  max_tokens?: number
  stream?: boolean
}

export interface ZhipuChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ZhipuChoice[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ZhipuChoice {
  index: number
  message: {
    role: string
    content: string
  }
  finish_reason: string
}

export interface ZhipuErrorResponse {
  error: {
    code: string
    message: string
    type: string
  }
}

// Scene types for story-to-scenes generation
export interface Scene {
  order_index: number
  description: string
}

export interface StoryToScenesResponse {
  scenes: Scene[]
}
