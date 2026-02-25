-- Spring FES Video - Supabase 数据库 Schema
-- 执行步骤: 在 Supabase Dashboard 的 SQL Editor 中运行此脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 启用 Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::timestamp) NOT NULL
);

-- ============================================
-- 项目表
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  style TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'draft' CHECK (stage IN ('draft', 'scenes', 'images', 'videos', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::timestamp) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::timestamp) NOT NULL
);

-- ============================================
-- 分镜表
-- ============================================
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  description TEXT NOT NULL,
  description_confirmed BOOLEAN DEFAULT FALSE,
  image_status TEXT DEFAULT 'pending' CHECK (image_status IN ('pending', 'processing', 'completed', 'failed')),
  image_confirmed BOOLEAN DEFAULT FALSE,
  video_status TEXT DEFAULT 'pending' CHECK (video_status IN ('pending', 'processing', 'completed', 'failed')),
  video_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::timestamp) NOT NULL
);

-- ============================================
-- 图片表
-- ============================================
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  storage_path TEXT,
  url TEXT,
  width INTEGER,
  height INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::timestamp) NOT NULL
);

-- ============================================
-- 视频表
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  storage_path TEXT,
  url TEXT,
  duration INTEGER,
  task_id TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::timestamp) NOT NULL
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_images_scene_id ON images(scene_id);
CREATE INDEX IF NOT EXISTS idx_videos_scene_id ON videos(scene_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- 用户可以查看和创建自己的项目
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- 用户可以查看自己项目的分镜
CREATE POLICY "Users can view scenes of own projects" ON scenes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid()
  ));

-- 用户可以查看自己项目分镜的图片和视频
CREATE POLICY "Users can view images of own projects" ON images
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM scenes
    JOIN projects ON projects.id = scenes.project_id
    WHERE scenes.id = images.scene_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can view videos of own projects" ON videos
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM scenes
    JOIN projects ON projects.id = scenes.project_id
    WHERE scenes.id = videos.scene_id AND projects.user_id = auth.uid()
  ));

-- 应用所有策略
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 存储桶
-- ============================================
-- 在 Supabase Storage 中创建名为 'project-media' 的存储桶
-- 用于存储用户上传的图片和视频文件
