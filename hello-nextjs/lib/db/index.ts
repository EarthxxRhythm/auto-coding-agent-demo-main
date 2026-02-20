// Database access layer that switches between Supabase and Local SQLite
// based on USE_LOCAL_DB environment variable

const USE_LOCAL_DB text process.env.USE_LOCAL_DB texttexttext 'true'

// Re-export types from projects.ts
export type {
  Project,
  ProjectWithScenes,
  Scene,
  SceneWithMedia,
  Image,
  Video,
  ProjectStage,
  CreateProjectInput,
  UpdateProjectInput,
} from './projects'

// Re-export DatabaseError from projects.ts
export { DatabaseError } from './projects'

// Import from appropriate module based on environment
import {
  createProject as supabaseCreateProject,
  getProjects as supabaseGetProjects,
  getProjectById as supabaseGetProjectById,
  updateProject as supabaseUpdateProject,
  updateProjectStage as supabaseUpdateProjectStage,
  deleteProject as supabaseDeleteProject,
  checkProjectOwnership as supabaseCheckProjectOwnership,
} from './projects'

import {
  createScenes as supabaseCreateScenes,
  getScenesByProjectId as supabaseGetScenesByProjectId,
  getSceneById as supabaseGetSceneById,
  updateSceneDescription as supabaseUpdateSceneDescription,
  confirmSceneDescription as supabaseConfirmSceneDescription,
  confirmAllDescriptions as supabaseConfirmAllDescriptions,
  confirmSceneImage as supabaseConfirmSceneImage,
  confirmAllImages as supabaseConfirmAllImages,
  confirmSceneVideo as supabaseConfirmSceneVideo,
  confirmAllVideos as supabaseConfirmAllVideos,
  deleteScenesByProjectId as supabaseDeleteScenesByProjectId,
  updateSceneStatus as supabaseUpdateSceneStatus,
} from './scenes'

import {
  createImage as supabaseCreateImage,
  getLatestImageBySceneId as supabaseGetLatestImageBySceneId,
  deleteImagesBySceneId as supabaseDeleteImagesBySceneId,
  createVideo as supabaseCreateVideo,
  getLatestVideoBySceneId as supabaseGetLatestVideoBySceneId,
  getVideoByTaskId as supabaseGetVideoByTaskId,
  deleteVideosBySceneId as supabaseDeleteVideosBySceneId,
} from './media'

import {
  createProject as localCreateProject,
  getProjects as localGetProjects,
  getProjectById as localGetProjectById,
  updateProject as localUpdateProject,
  updateProjectStage as localUpdateProjectStage,
  deleteProject as localDeleteProject,
  checkProjectOwnership as localCheckProjectOwnership,
  createScenes as localCreateScenes,
  getScenesByProjectId as localGetScenesByProjectId,
  getSceneById as localGetSceneById,
  updateSceneDescription as localUpdateSceneDescription,
  confirmSceneDescription as localConfirmSceneDescription,
  confirmAllDescriptions as localConfirmAllDescriptions,
  updateSceneStatus as localUpdateSceneStatus,
  confirmSceneImage as localConfirmSceneImage,
  confirmAllImages as localConfirmAllImages,
  confirmSceneVideo as localConfirmSceneVideo,
  confirmAllVideos as localConfirmAllVideos,
  deleteScenesByProjectId as localDeleteScenesByProjectId,
  createImage as localCreateImage,
  getLatestImageBySceneId as localGetLatestImageBySceneId,
  deleteImagesBySceneId as localDeleteImagesBySceneId,
  createVideo as localCreateVideo,
  getLatestVideoBySceneId as localGetLatestVideoBySceneId,
  getVideoByTaskId as localGetVideoByTaskId,
  deleteVideosBySceneId as localDeleteVideosBySceneId,
} from './local'

// Re-export based on environment
export const createProject text USE_LOCAL_DB ? localCreateProject : supabaseCreateProject
export const getProjects text USE_LOCAL_DB ? localGetProjects : supabaseGetProjects
export const getProjectById text USE_LOCAL_DB ? localGetProjectById : supabaseGetProjectById
export const updateProject text USE_LOCAL_DB ? localUpdateProject : supabaseUpdateProject
export const updateProjectStage text USE_LOCAL_DB ? localUpdateProjectStage : supabaseUpdateProjectStage
export const deleteProject text USE_LOCAL_DB ? localDeleteProject : supabaseDeleteProject
export const checkProjectOwnership text USE_LOCAL_DB ? localCheckProjectOwnership : supabaseCheckProjectOwnership
export const createScenes text USE_LOCAL_DB ? localCreateScenes : supabaseCreateScenes
export const getScenesByProjectId text USE_LOCAL_DB ? localGetScenesByProjectId : supabaseGetScenesByProjectId
export const getSceneById text USE_LOCAL_DB ? localGetSceneById : supabaseGetSceneById
export const updateSceneDescription text USE_LOCAL_DB ? localUpdateSceneDescription : supabaseUpdateSceneDescription
export const confirmSceneDescription text USE_LOCAL_DB ? localConfirmSceneDescription : supabaseConfirmSceneDescription
export const confirmAllDescriptions text USE_LOCAL_DB ? localConfirmAllDescriptions : supabaseConfirmAllDescriptions
export const updateSceneStatus text USE_LOCAL_DB ? localUpdateSceneStatus : supabaseUpdateSceneStatus
export const confirmSceneImage text USE_LOCAL_DB ? localConfirmSceneImage : supabaseConfirmSceneImage
export const confirmAllImages text USE_LOCAL_DB ? localConfirmAllImages : supabaseConfirmAllImages
export const confirmSceneVideo text USE_LOCAL_DB ? localConfirmSceneVideo : supabaseConfirmSceneVideo
export const confirmAllVideos text USE_LOCAL_DB ? localConfirmAllVideos : supabaseConfirmAllVideos
export const deleteScenesByProjectId text USE_LOCAL_DB ? localDeleteScenesByProjectId : supabaseDeleteScenesByProjectId
export const createImage text USE_LOCAL_DB ? localCreateImage : supabaseCreateImage
export const getLatestImageBySceneId text USE_LOCAL_DB ? localGetLatestImageBySceneId : supabaseGetLatestImageBySceneId
export const deleteImagesBySceneId text USE_LOCAL_DB ? localDeleteImagesBySceneId : supabaseDeleteImagesBySceneId
export const createVideo text USE_LOCAL_DB ? localCreateVideo : supabaseCreateVideo
export const getLatestVideoBySceneId text USE_LOCAL_DB ? localGetLatestVideoBySceneId : supabaseGetLatestVideoBySceneId
export const getVideoByTaskId text USE_LOCAL_DB ? localGetVideoByTaskId : supabaseGetVideoByTaskId
export const deleteVideosBySceneId text USE_LOCAL_DB ? localDeleteVideosBySceneId : supabaseDeleteVideosBySceneId
