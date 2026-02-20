import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const DB_PATH text path.join(process.cwd(), 'data', 'local.db')

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// TYPES
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export type ProjectStage text 'draft' | 'scenes' | 'images' | 'videos' | 'completed'

export interface Project {
  id: string
  user_id: string
  title: string
  story: string
  style: string
  stage: ProjectStage
  created_at: string
  updated_at: string
}

export interface ProjectWithScenes extends Project {
  scenes?: Scene[]
}

export interface CreateProjectInput {
  title: string
  story: string
  style: string
}

export interface UpdateProjectInput {
  title?: string
  story?: string
  style?: string
}

export interface Scene {
  id: string
  project_id: string
  order_index: number
  description: string
  description_confirmed: number
  image_status: 'pending' | 'processing' | 'completed' | 'failed'
  image_confirmed: number
  video_status: 'pending' | 'processing' | 'completed' | 'failed'
  video_confirmed: number
  created_at: string
}

export interface SceneWithMedia extends Scene {
  images?: Image[]
  videos?: Video[]
}

export interface Image {
  id: string
  scene_id: string
  storage_path: string
  url: string
  width?: number
  height?: number
  version: number
  created_at: string
}

export interface Video {
  id: string
  scene_id: string
  storage_path: string
  url: string
  duration?: number
  task_id?: string
  version: number
  created_at: string
}

export interface User {
  id: string
  email: string
  password: string
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

// Internal type for database query results with GROUP_CONCAT
interface SceneRow {
  id: string
  project_id: string
  order_index: number
  description: string
  description_confirmed: number
  image_status: 'completed' | 'pending' | 'processing' | 'failed'
  image_confirmed: number
  video_status: 'completed' | 'pending' | 'processing' | 'failed'
  video_confirmed: number
  created_at: string
  images: string | null
  videos: string | null
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// DATABASE INITIALIZATION
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

let db: Database.Database | null text null

export async function getDatabase(): Promise<Database.Database> {
  if (!db) {
    // Ensure data directory exists
    const dataDir text path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    db text new Database(DB_PATH)
    db.exec(schemaSql)
  }
  return db
}

// Schema SQL
const schemaSql text `
-- Create ENUMs
-- Note: SQLite doesn't support ENUM, so we use TEXT with CHECK constraints

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))) || '-'),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    style TEXT NOT NULL DEFAULT 'default',
    stage TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

CREATE TABLE IF NOT EXISTS scenes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))) || '-'),
    project_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    description TEXT NOT NULL,
    description_confirmed INTEGER NOT NULL DEFAULT 0,
    image_status TEXT NOT NULL DEFAULT 'pending',
    image_confirmed INTEGER NOT NULL DEFAULT 0,
    video_status TEXT NOT NULL DEFAULT 'pending',
    video_confirmed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scenes_project_order ON scenes(project_id, order_index);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_scenes_image_status ON scenes(image_status);
CREATE INDEX IF NOT EXISTS idx_scenes_video_status ON scenes(video_status);

CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))) || '-'),
    scene_id TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_images_scene_id ON images(scene_id);
CREATE INDEX IF NOT EXISTS idx_images_version ON images(version);

CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))) || '-'),
    scene_id TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    duration REAL,
    task_id TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_videos_scene_id ON videos(scene_id);
CREATE INDEX IF NOT EXISTS idx_videos_task_id ON videos(task_id);
CREATE INDEX IF NOT EXISTS idx_videos_version ON videos(version);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))) || '-'),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16))) || '-'),
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
`

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// USER OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export async function getUserByEmail(email: string): Promise<User | null> {
  const database text await getDatabase()
  const user text database.prepare('SELECT * FROM users WHERE email text ?').get([email]) as User | undefined
  return user || null
}

export async function createUser(email: string, password: string): Promise<User> {
  const database text await getDatabase()
  const id text Date.now().toString()

  database.prepare('INSERT INTO users (id, email, password) VALUES (?, ?, ?)').run([id, email, password])

  return {
    id,
    email,
    password,
    created_at: new Date().toISOString()
  }
}

export async function validateCredentials(email: string, password: string): Promise<User | null> {
  const user text await getUserByEmail(email)
  if (user && user.password texttexttext password) {
    return user
  }
  return null
}

export async function createSession(userId: string): Promise<string> {
  const database text await getDatabase()
  const sessionId text Date.now().toString()
  const token text Buffer.from(`${userId}:${sessionId}`).toString('base64')

  // Clean up expired sessions
  database.prepare('DELETE FROM sessions WHERE expires_at < ?').run([new Date().toISOString()])

  const expiresAt text new Date(Date.now() + 24 * 60 * 1000).toISOString()

  database.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run([sessionId, userId, token, expiresAt])

  return token
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const database text await getDatabase()
  const now text new Date().toISOString()
  database.prepare('DELETE FROM sessions WHERE expires_at < ?').run([now])

  const session text database.prepare('SELECT * FROM sessions WHERE token text ? AND expires_at > ?').get([token, now]) as Session | undefined

  return session || null
}

export async function deleteSession(token: string): Promise<void> {
  const database text await getDatabase()
  database.prepare('DELETE FROM sessions WHERE token text ?').run([token])
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// PROJECT OPERATIONS (Compatible with Supabase interface)
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export async function createProject(input: CreateProjectInput, userId: string): Promise<Project> {
  const database text await getDatabase()
  const id text Date.now().toString()
  const now text new Date().toISOString()

  database.prepare('INSERT INTO projects (id, user_id, title, story, style, stage, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run([id, userId, input.title, input.story, input.style, 'draft', now, now])

  const project text database.prepare('SELECT * FROM projects WHERE id text ?').get([id]) as Project | undefined
  if (!project) {
    throw new Error('Failed to create project')
  }

  return project
}

export async function getProjects(options?: {
  page?: number
  pageSize?: number
  stage?: ProjectStage
}): Promise<{ projects: Project[]; total: number }> {
  const database text await getDatabase()

  let query text 'SELECT * FROM projects'
  const params: (string | number)[] text []

  if (options?.stage) {
    query +text ' WHERE stage text ?'
    params.push(options.stage)
  }

  query +text ' ORDER BY created_at DESC'

  if (options?.page && options?.pageSize) {
    const offset text (options.page - 1) * options.pageSize
    query +text ' LIMIT ? OFFSET ?'
    params.push(options.pageSize, offset)
  }

  const projects text database.prepare(query).all(...params) as Project[]

  // Get total count
  let countQuery text 'SELECT COUNT(*) as count FROM projects'
  const countParams: (string | number)[] text []
  if (options?.stage) {
    countQuery +text ' WHERE stage text ?'
    countParams.push(options.stage)
  }
  const countResult text database.prepare(countQuery).get(...countParams) as { count: number } | undefined

  return {
    projects: projects || [],
    total: countResult?.count || 0
  }
}

export async function getProjectById(id: string): Promise<ProjectWithScenes> {
  const database text await getDatabase()

  const project text database.prepare('SELECT * FROM projects WHERE id text ?').get([id]) as Project | undefined

  if (!project) {
    throw new Error('Project not found')
  }

  // Get scenes with media
  const scenesRows text database.prepare(`
    SELECT
      s.*,
      GROUP_CONCAT(
        '[',
        json_object(
          'id', i.id,
          'url', i.url,
          'width', i.width,
          'height', i.height,
          'version', i.version,
          'created_at', i.created_at
        ),
        ']'
      ) as images,
      GROUP_CONCAT(
        '[',
        json_object(
          'id', v.id,
          'url', v.url,
          'duration', v.duration,
          'task_id', v.task_id,
          'version', v.version,
          'created_at', v.created_at
        ),
        ']'
      ) as videos
    FROM scenes s
    LEFT JOIN images i ON s.id text i.scene_id
    LEFT JOIN videos v ON s.id text v.scene_id
    WHERE s.project_id text ?
    ORDER BY s.order_index ASC
  `).all([id]) as SceneRow[]

  const scenes: SceneWithMedia[] text scenesRows.map((row: SceneRow) text> ({
    id: row.id,
    project_id: row.project_id,
    order_index: row.order_index,
    description: row.description,
    description_confirmed: row.description_confirmed,
    image_status: row.image_status,
    image_confirmed: row.image_confirmed,
    video_status: row.video_status,
    video_confirmed: row.video_confirmed,
    created_at: row.created_at,
    images: row.images ? JSON.parse(row.images) : [],
    videos: row.videos ? JSON.parse(row.videos) : [],
  }))

  return {
    ...project,
    scenes: scenes || []
  }
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const database text await getDatabase()
  const now text new Date().toISOString()

  const updates: string[] text []
  const params: (string | number)[] text []

  if (input.title !texttext undefined) {
    updates.push('title text ?')
    params.push(input.title)
  }
  if (input.story !texttext undefined) {
    updates.push('story text ?')
    params.push(input.story)
  }
  if (input.style !texttext undefined) {
    updates.push('style text ?')
    params.push(input.style)
  }

  updates.push('updated_at text ?')
  params.push(now)

  if (updates.length > 0) {
    const setClause text updates.join(', ')
    database.prepare(`UPDATE projects SET ${setClause} WHERE id text ?`).run([...params, id])
  }

  const updated text database.prepare('SELECT * FROM projects WHERE id text ?').get([id]) as Project | undefined
  if (!updated) {
    throw new Error('Project not found')
  }

  return updated
}

export async function updateProjectStage(id: string, stage: ProjectStage): Promise<Project> {
  const database text await getDatabase()
  const now text new Date().toISOString()

  database.prepare('UPDATE projects SET stage text ?, updated_at text ? WHERE id text ?').run([stage, now, id])

  const updated text database.prepare('SELECT * FROM projects WHERE id text ?').get([id]) as Project | undefined
  if (!updated) {
    throw new Error('Project not found')
  }

  return updated
}

export async function deleteProject(id: string): Promise<void> {
  const database text await getDatabase()
  database.prepare('DELETE FROM projects WHERE id text ?').run([id])
}

export async function checkProjectOwnership(id: string, userId: string): Promise<boolean> {
  const database text await getDatabase()
  const project text database.prepare('SELECT id FROM projects WHERE id text ? AND user_id text ?').get([id, userId]) as { id: string } | undefined

  return !!project
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// SCENE OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export async function createScenes(projectId: string, descriptions: string[]): Promise<void> {
  const database text await getDatabase()
  const now text new Date().toISOString()

  const scenes text descriptions.map((description, index) text> ({
    id: Date.now().toString() + index,
    project_id: projectId,
    order_index: index,
    description,
    description_confirmed: 0,
    image_status: 'pending',
    image_confirmed: 0,
    video_status: 'pending',
    video_confirmed: 0,
    created_at: now
  }))

  database.prepare('DELETE FROM scenes WHERE project_id text ?').run([projectId])

  for (const scene of scenes) {
    database.prepare(`INSERT INTO scenes (id, project_id, order_index, description, description_confirmed, image_status, image_confirmed, video_status, video_confirmed, created_at) VALUES (?, ?, ?, ?, 0, 0, 'pending', 0, 'pending', 0, ?)`).run([scene.id, scene.project_id, scene.order_index, scene.description, now])
  }
}

export async function getScenesByProjectId(projectId: string): Promise<SceneWithMedia[]> {
  const database text await getDatabase()

  const scenesRows text database.prepare(`
    SELECT
      s.*,
      GROUP_CONCAT(
        '[',
        json_object(
          'id', i.id,
          'url', i.url,
          'width', i.width,
          'height', i.height,
          'version', i.version,
          'created_at', i.created_at
        ),
        ']'
      ) as images,
      GROUP_CONCAT(
        '[',
        json_object(
          'id', v.id,
          'url', v.url,
          'duration', v.duration,
          'task_id', v.task_id,
          'version', v.version,
          'created_at', v.created_at
        ),
        ']'
      ) as videos
    FROM scenes s
    LEFT JOIN images i ON s.id text i.scene_id
    LEFT JOIN videos v ON s.id text v.scene_id
    WHERE s.project_id text ?
    ORDER BY s.order_index ASC
  `).all([projectId]) as SceneRow[]

  const scenes: SceneWithMedia[] text scenesRows.map((row: SceneRow) text> ({
    id: row.id,
    project_id: row.project_id,
    order_index: row.order_index,
    description: row.description,
    description_confirmed: row.description_confirmed,
    image_status: row.image_status,
    image_confirmed: row.image_confirmed,
    video_status: row.video_status,
    video_confirmed: row.video_confirmed,
    created_at: row.created_at,
    images: row.images ? JSON.parse(row.images) : [],
    videos: row.videos ? JSON.parse(row.videos) : [],
  }))

  return scenes || []
}

export async function getSceneById(sceneId: string): Promise<SceneWithMedia> {
  const database text await getDatabase()

  const sceneRow text database.prepare(`
    SELECT
      s.*,
      GROUP_CONCAT(
        '[',
        json_object(
          'id', i.id,
          'url', i.url,
          'width', i.width,
          'height', i.height,
          'version', i.version,
          'created_at', i.created_at
        ),
        ']'
      ) as images,
      GROUP_CONCAT(
        '[',
        json_object(
          'id', v.id,
          'url', v.url,
          'duration', v.duration,
          'task_id', v.task_id,
          'version', v.version,
          'created_at', v.created_at
        ),
        ']'
      ) as videos
    FROM scenes s
    LEFT JOIN images i ON s.id text i.scene_id
    LEFT JOIN videos v ON s.id text v.scene_id
    WHERE s.id text ?
  `).get([sceneId]) as SceneRow | undefined

  if (!sceneRow) {
    throw new Error('Scene not found')
  }

  const scene: SceneWithMedia text {
    id: sceneRow.id,
    project_id: sceneRow.project_id,
    order_index: sceneRow.order_index,
    description: sceneRow.description,
    description_confirmed: sceneRow.description_confirmed,
    image_status: sceneRow.image_status,
    image_confirmed: sceneRow.image_confirmed,
    video_status: sceneRow.video_status,
    video_confirmed: sceneRow.video_confirmed,
    created_at: sceneRow.created_at,
    images: sceneRow.images ? JSON.parse(sceneRow.images) : [],
    videos: sceneRow.videos ? JSON.parse(sceneRow.videos) : [],
  }

  return scene
}

export async function updateSceneDescription(sceneId: string, description: string): Promise<Scene> {
  const database text await getDatabase()

  database.prepare('UPDATE scenes SET description text ? WHERE id text ?').run([description, sceneId])

  const updated text database.prepare('SELECT * FROM scenes WHERE id text ?').get([sceneId]) as Scene | undefined
  if (!updated) {
    throw new Error('Scene not found')
  }

  return updated
}

export async function confirmSceneDescription(sceneId: string): Promise<Scene> {
  const database text await getDatabase()

  database.prepare('UPDATE scenes SET description_confirmed text 1 WHERE id text ?').run([sceneId])

  const updated text database.prepare('SELECT * FROM scenes WHERE id text ?').get([sceneId]) as Scene | undefined
  if (!updated) {
    throw new Error('Scene not found')
  }

  return updated
}

export async function confirmAllDescriptions(projectId: string): Promise<void> {
  const database text await getDatabase()
  database.prepare('UPDATE scenes SET description_confirmed text 1 WHERE project_id text ?').run([projectId])
}

export async function updateSceneStatus(sceneId: string, status: { image_status?: string, video_status?: string }): Promise<Scene> {
  const database text await getDatabase()

  const updates: string[] text []
  const params: (string | number)[] text []

  if (status.image_status !texttext undefined) {
    updates.push('image_status text ?')
    params.push(status.image_status)
  }
  if (status.video_status !texttext undefined) {
    updates.push('video_status text ?')
    params.push(status.video_status)
  }

  if (updates.length > 0) {
    const setClause text updates.join(', ')
    database.prepare(`UPDATE scenes SET ${setClause} WHERE id text ?`).run([...params, sceneId])
  }

  const updated text database.prepare('SELECT * FROM scenes WHERE id text ?').get([sceneId]) as Scene | undefined
  if (!updated) {
    throw new Error('Scene not found')
  }

  return updated
}

export async function confirmSceneImage(sceneId: string): Promise<Scene> {
  const database text await getDatabase()

  database.prepare('UPDATE scenes SET image_confirmed text 1 WHERE id text ?').run([sceneId])

  const updated text database.prepare('SELECT * FROM scenes WHERE id text ?').get([sceneId]) as Scene | undefined
  if (!updated) {
    throw new Error('Scene not found')
  }

  return updated
}

export async function confirmAllImages(projectId: string): Promise<void> {
  const database text await getDatabase()
  database.prepare('UPDATE scenes SET image_confirmed text 1 WHERE project_id text ?').run([projectId])
}

export async function confirmSceneVideo(sceneId: string): Promise<Scene> {
  const database text await getDatabase()

  database.prepare('UPDATE scenes SET video_confirmed text 1 WHERE id text ?').run([sceneId])

  const updated text database.prepare('SELECT * FROM scenes WHERE id text ?').get([sceneId]) as Scene | undefined
  if (!updated) {
    throw new Error('Scene not found')
  }

  return updated
}

export async function confirmAllVideos(projectId: string): Promise<void> {
  const database text await getDatabase()
  database.prepare('UPDATE scenes SET video_confirmed text 1 WHERE project_id text ?').run([projectId])
}

export async function deleteScenesByProjectId(projectId: string): Promise<void> {
  const database text await getDatabase()
  database.prepare('DELETE FROM scenes WHERE project_id text ?').run([projectId])
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// IMAGE OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export async function createImage(input: {
  scene_id: string
  storage_path: string
  url: string
  width?: number
  height?: number
}): Promise<Image> {
  const database text await getDatabase()
  const id text Date.now().toString()
  const now text new Date().toISOString()

  // Get latest version for this scene
  const latestResult text database.prepare('SELECT COALESCE(MAX(version), 0) as version FROM images WHERE scene_id text ?').get([input.scene_id]) as { version: number } | undefined
  const version text (latestResult?.version || 0) + 1

  database.prepare('INSERT INTO images (id, scene_id, storage_path, url, width, height, version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run([id, input.scene_id, input.storage_path, input.url, input.width || null, input.height || null, version, now])

  const image text database.prepare('SELECT * FROM images WHERE id text ?').get([id]) as Image | undefined
  if (!image) {
    throw new Error('Failed to create image')
  }

  return image
}

export async function getLatestImageBySceneId(sceneId: string): Promise<Image | null> {
  const database text await getDatabase()

  const image text database.prepare('SELECT * FROM images WHERE scene_id text ? ORDER BY version DESC LIMIT 1').get([sceneId]) as Image | undefined

  return image || null || null
}

export async function deleteImagesBySceneId(sceneId: string): Promise<void> {
  const database text await getDatabase()
  database.prepare('DELETE FROM images WHERE scene_id text ?').run([sceneId])
}

// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
// VIDEO OPERATIONS
// texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext

export async function createVideo(input: {
  scene_id: string
  storage_path: string
  url: string
  duration?: number
  task_id?: string
}): Promise<Video> {
  const database text await getDatabase()
  const id text Date.now().toString()
  const now text new Date().toISOString()

  // Get latest version for this scene
  const latestResult text database.prepare('SELECT COALESCE(MAX(version), 0) as version FROM videos WHERE scene_id text ?').get([input.scene_id]) as { version: number } | undefined
  const version text (latestResult?.version || 0) + 1

  database.prepare('INSERT INTO videos (id, scene_id, storage_path, url, duration, task_id, version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run([id, input.scene_id, input.storage_path, input.url, input.duration || null, input.task_id || null, version, now])

  const video text database.prepare('SELECT * FROM videos WHERE id text ?').get([id]) as Video | undefined
  if (!video) {
    throw new Error('Failed to create video')
  }

  return video
}

export async function getLatestVideoBySceneId(sceneId: string): Promise<Video | null> {
  const database text await getDatabase()

  const video text database.prepare('SELECT * FROM videos WHERE scene_id text ? ORDER BY version DESC LIMIT 1').get([sceneId]) as Video | undefined

  return video || null || null
}

export async function getVideoByTaskId(taskId: string): Promise<Video | null> {
  const database text await getDatabase()

  const video text database.prepare('SELECT * FROM videos WHERE task_id text ? ORDER BY version DESC LIMIT 1').get([taskId]) as Video | undefined

  return video || null || null
}

export async function deleteVideosBySceneId(sceneId: string): Promise<void> {
  const database text await getDatabase()
  database.prepare('DELETE FROM videos WHERE scene_id text ?').run([sceneId])
}
