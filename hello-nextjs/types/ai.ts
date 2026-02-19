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

// Volcengine (火山引擎) types
export interface VolcImageRequest {
  req_key: string
  prompt: string
  image_prompt?: string
  seed?: number
  scale?: number
  width?: number
  height?: number
  return_url?: boolean
  use_rpm?: boolean
}

export interface VolcImageResponse {
  status_code: number
  request_id: string
  data: {
    image_base64?: string
    image_url?: string
  }
}

export interface VolcErrorResponse {
  status_code: number
  request_id: string
  error: {
    code: number
    message: string
  }
}

// Volcengine Video types
export interface VolcVideoTaskRequest {
  req_key: string
  prompt: string
  image_url?: string
  image_base64?: string
  video_length?: number
}

export interface VolcVideoTaskResponse {
  status_code: number
  request_id: string
  data: {
    task_id: string
    status: string
  }
}

export interface VolcVideoStatusRequest {
  req_key: string
  task_id: string
}

export interface VolcVideoStatusResponse {
  status_code: number
  request_id: string
  data: {
    task_id: string
    status: string
    video_url?: string
    video_base64?: string
  }
}

export interface VideoTaskStatus {
  task_id: string
  status: 'processing' | 'completed' | 'failed'
  video_url?: string
  video_base64?: string
}
