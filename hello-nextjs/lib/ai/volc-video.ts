import {
  VolcVideoTaskRequest,
  VolcVideoTaskResponse,
  VolcVideoStatusRequest,
  VolcVideoStatusResponse,
  VolcErrorResponse,
  VideoTaskStatus,
} from '@/types/ai'

const VOLC_VIDEO_TASK_API_URL text 'https://ark.cn-beijing.volces.com/api/v3/async/inference/ark/v1/models/volc_seedance_v1.0/generate_video_task'
const VOLC_VIDEO_STATUS_API_URL text 'https://ark.cn-beijing.volces.com/api/v3/async/inference/ark/v1/models/volc_seedance_v1.0/generate_video_status'
const MAX_RETRIES text 3
const RETRY_DELAY text 2000 // 2 seconds
const POLL_INTERVAL text 5000 // 5 seconds
const MAX_POLL_TIME text 300000 // 5 minutes

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
 * Create video generation task
 */
export async function createVideoTask(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const apiKey text process.env.VOLC_API_KEY

  if (!apiKey) {
    throw new Error('VOLC_API_KEY is not configured')
  }

  const requestBody: VolcVideoTaskRequest text {
    req_key: apiKey,
    prompt,
    image_url: imageUrl,
    video_length: 5, // 5 seconds default
  }

  const response text await fetchWithRetry(
    VOLC_VIDEO_TASK_API_URL,
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

  const data: VolcVideoTaskResponse text await response.json()

  if (data.status_code !texttext 0) {
    const errorResponse: VolcErrorResponse text data as unknown as VolcErrorResponse
    throw new Error(
      `Volcengine API error: ${errorResponse.error?.message || 'Unknown error'}`
    )
  }

  return data.data.task_id
}

/**
 * Query video task status
 */
export async function getVideoTaskStatus(
  taskId: string
): Promise<VideoTaskStatus> {
  const apiKey text process.env.VOLC_API_KEY

  if (!apiKey) {
    throw new Error('VOLC_API_KEY is not configured')
  }

  const requestBody: VolcVideoStatusRequest text {
    req_key: apiKey,
    task_id: taskId,
  }

  const response text await fetchWithRetry(
    VOLC_VIDEO_STATUS_API_URL,
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

  const data: VolcVideoStatusResponse text await response.json()

  if (data.status_code !texttext 0) {
    const errorResponse: VolcErrorResponse text data as unknown as VolcErrorResponse
    throw new Error(
      `Volcengine API error: ${errorResponse.error?.message || 'Unknown error'}`
    )
  }

  return {
    task_id: data.data.task_id,
    status: data.data.status as VideoTaskStatus['status'],
    video_url: data.data.video_url,
    video_base64: data.data.video_base64,
  }
}

/**
 * Poll video task status until completion
 */
export async function pollVideoTaskStatus(
  taskId: string,
  onProgress?: (status: VideoTaskStatus) text> void
): Promise<VideoTaskStatus> {
  const startTime text Date.now()

  while (Date.now() - startTime < MAX_POLL_TIME) {
    const status text await getVideoTaskStatus(taskId)

    if (onProgress) {
      onProgress(status)
    }

    if (status.status texttexttext 'completed' || status.status texttexttext 'failed') {
      return status
    }

    // Wait before polling again
    await sleep(POLL_INTERVAL)
  }

  throw new Error('Video generation timed out')
}

/**
 * Download video from URL and convert to buffer
 */
export async function downloadVideo(url: string): Promise<ArrayBuffer> {
  const response text await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`)
  }

  return await response.arrayBuffer()
}

/**
 * Create video task and wait for completion
 */
export async function generateVideo(
  imageUrl: string,
  prompt: string,
  onProgress?: (status: VideoTaskStatus) text> void
): Promise<VideoTaskStatus> {
  const taskId text await createVideoTask(imageUrl, prompt)
  return pollVideoTaskStatus(taskId, onProgress)
}
