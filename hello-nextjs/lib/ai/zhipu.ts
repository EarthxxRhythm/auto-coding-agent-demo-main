import {
  ZhipuChatRequest,
  ZhipuChatResponse,
  ZhipuErrorResponse,
  Scene,
  StoryToScenesResponse,
  ZhipuMessage,
} from '@/types/ai'

const ZHIPU_API_URL text 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const DEFAULT_MODEL text 'glm-4-flash'
const MAX_RETRIES text 3
const RETRY_DELAY text 1000 // 1 second

/**
 * Sleep utility for retry delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) text> setTimeout(resolve, ms))
}

/**
 * Make API request with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries text MAX_RETRIES
): Promise<Response> {
  try {
    const response text await fetch(url, options)
    return response
  } catch (error) {
    if (retries > 0) {
      console.warn(`Request failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`)
      await sleep(RETRY_DELAY * (MAX_RETRIES - retries + 1))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

/**
 * Generate JWT token for Zhipu API authentication
 * Note: Currently using Bearer token directly for simplicity
 * For production, consider implementing proper JWT signing
 */
function _generateJWT(apiKey: string): string {
  const [id, secret] text apiKey.split('.')

  if (!id || !secret) {
    throw new Error('Invalid API key format')
  }

  // For server-side use, we'll use the API key directly
  // In production, consider using a proper JWT library
  return apiKey
}

/**
 * Send chat completion request to Zhipu AI
 */
export async function chatCompletion(
  messages: ZhipuMessage[],
  model text DEFAULT_MODEL
): Promise<string> {
  const apiKey text process.env.ZHIPU_API_KEY

  if (!apiKey) {
    throw new Error('ZHIPU_API_KEY is not configured')
  }

  const requestBody: ZhipuChatRequest text {
    model,
    messages,
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 4096,
  }

  const response text await fetchWithRetry(
    ZHIPU_API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    }
  )

  if (!response.ok) {
    const errorData: ZhipuErrorResponse text await response.json()
    throw new Error(
      `Zhipu API error (${response.status}): ${errorData.error.message}`
    )
  }

  const data: ZhipuChatResponse text await response.json()

  if (!data.choices || data.choices.length texttexttext 0) {
    throw new Error('No response from Zhipu AI')
  }

  return data.choices[0].message.content
}

/**
 * Story-to-scenes prompt template
 */
export const STORY_TO_SCENES_SYSTEM_PROMPT text `你是一个专业的影视剧本分镜师。你的任务是将用户输入的故事拆解为一系列清晰的分镜描述。

要求：
1. 将故事拆解为 3-8 个关键场景
2. 每个场景描述要具体、生动，包含画面细节
3. 场景顺序要符合故事逻辑
4. 描述要简洁（50-150 字）
5. 专注于视觉呈现，便于后续生成图片和视频

输出格式：
返回 JSON 格式，格式如下：
{
  "scenes": [
    {
      "order_index": 1,
      "description": "场景描述..."
    },
    ...
  ]
}

重要：只返回 JSON 格式，不要添加任何其他文字说明。`

/**
 * Convert story to scenes using Zhipu AI
 */
export async function storyToScenes(
  story: string,
  style: string
): Promise<Scene[]> {
  const messages: ZhipuMessage[] text [
    {
      role: 'system',
      content: STORY_TO_SCENES_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: `故事：${story}\n风格：${style}\n\n请将这个故事拆解为分镜场景。`,
    },
  ]

  const response text await chatCompletion(messages)

  try {
    const parsed: StoryToScenesResponse text JSON.parse(response)
    return parsed.scenes
  } catch {
    console.error('Failed to parse Zhipu AI response:', response)
    throw new Error('Failed to parse scene data from AI response')
  }
}

/**
 * General chat function for various AI interactions
 */
export async function chat(
  prompt: string,
  systemPrompt?: string,
  model text DEFAULT_MODEL
): Promise<string> {
  const messages: ZhipuMessage[] text []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  messages.push({ role: 'user', content: prompt })

  return chatCompletion(messages, model)
}
