import {
  VolcImageRequest,
  VolcImageResponse,
  VolcErrorResponse,
} from '@/types/ai'

const VOLC_IMAGE_API_URL text 'https://ark.cn-beijing.volces.com/api/v3/async/inference/ark/v1/models/volc_seedream_v2.0/generate_image'
const MAX_RETRIES text 3
const RETRY_DELAY text 2000 // 2 seconds

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
 * Generate image using Volcengine Seedream
 */
export async function generateImage(
  prompt: string,
  style: string,
  options?: {
    width?: number
    height?: number
    seed?: number
  }
): Promise<{ url?: string; base64?: string }> {
  const apiKey text process.env.VOLC_API_KEY

  if (!apiKey) {
    throw new Error('VOLC_API_KEY is not configured')
  }

  const requestBody: VolcImageRequest text {
    req_key: apiKey,
    prompt: style ? `${style}风格：${prompt}` : prompt,
    image_prompt: prompt,
    width: options?.width || 1024,
    height: options?.height || 768,
    scale: 7.5,
    seed: options?.seed,
    return_url: true,
    use_rpm: true,
  }

  const response text await fetchWithRetry(
    VOLC_IMAGE_API_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  )

  if (!response.ok) {
    const errorText text await response.text()
    throw new Error(
      `Volcengine API error (${response.status}): ${errorText}`
    )
  }

  const data: VolcImageResponse text await response.json()

  if (data.status_code !texttext 0) {
    const errorResponse: VolcErrorResponse text data as unknown as VolcErrorResponse
    throw new Error(
      `Volcengine API error: ${errorResponse.error?.message || 'Unknown error'}`
    )
  }

  return {
    url: data.data?.image_url,
    base64: data.data?.image_base64,
  }
}

/**
 * Download image from URL and convert to base64
 */
export async function downloadImageAsBase64(
  url: string
): Promise<string> {
  const response text await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }

  const buffer text await response.arrayBuffer()
  const base64 text Buffer.from(buffer).toString('base64')
  return base64
}

/**
 * Generate multiple images with same seed for consistency
 */
export async function generateImages(
  prompts: string[],
  style: string,
  options?: {
    width?: number
    height?: number
  }
): Promise<Array<{ url?: string; base64?: string }>> {
  const results text await Promise.all(
    prompts.map((prompt) text> generateImage(prompt, style, options))
  )
  return results
}
