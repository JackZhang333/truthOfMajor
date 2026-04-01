-- 专业分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 专业表
CREATE TABLE majors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  code TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  degree_type TEXT,
  duration INTEGER,
  description TEXT,
  career_prospects TEXT,
  courses JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  personality_match TEXT,
  content JSONB DEFAULT '{}',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'reviewing', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户资料表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'expert', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 专家信息表
CREATE TABLE experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  nickname TEXT,
  current_company TEXT,
  position TEXT,
  work_years INTEGER,
  university TEXT,
  major TEXT,
  education TEXT CHECK (education IN ('本科', '硕士', '博士')),
  bio TEXT,
  certifications JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  level TEXT DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'diamond')),
  answer_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 专家擅长专业关联表
CREATE TABLE expert_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID REFERENCES experts(id) ON DELETE CASCADE,
  major_id UUID REFERENCES majors(id) ON DELETE CASCADE,
  UNIQUE(expert_id, major_id)
);

-- 问题表
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  major_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'answered', 'closed')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 回答表
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 专业过来人经验表
CREATE TABLE major_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  major_id UUID REFERENCES majors(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES experts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 点赞表
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT CHECK (target_type IN ('question', 'answer', 'major')),
  target_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- 通知表
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_majors_category ON majors(category_id);
CREATE INDEX idx_majors_status ON majors(status);
CREATE INDEX idx_majors_slug ON majors(slug);
CREATE INDEX idx_experts_status ON experts(status);
CREATE INDEX idx_experts_level ON experts(level);
CREATE INDEX idx_experts_user ON experts(user_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_user ON questions(user_id);
CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_expert ON answers(expert_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_majors_updated_at BEFORE UPDATE ON majors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experts_updated_at BEFORE UPDATE ON experts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入专业分类数据
INSERT INTO categories (name, slug, description, sort_order, icon) VALUES
('哲学', 'philosophy', '哲学类专业', 1, 'Brain'),
('经济学', 'economics', '经济学类专业', 2, 'TrendingUp'),
('法学', 'law', '法学类专业', 3, 'Scale'),
('教育学', 'education', '教育学类专业', 4, 'GraduationCap'),
('文学', 'literature', '文学类专业', 5, 'BookOpen'),
('历史学', 'history', '历史学类专业', 6, 'Clock'),
('理学', 'science', '理学类专业', 7, 'Atom'),
('工学', 'engineering', '工学类专业', 8, 'Cpu'),
('农学', 'agriculture', '农学类专业', 9, 'Leaf'),
('医学', 'medicine', '医学类专业', 10, 'Heart'),
('管理学', 'management', '管理学类专业', 11, 'Briefcase'),
('艺术学', 'arts', '艺术学类专业', 12, 'Palette');

-- 插入示例专业数据
INSERT INTO majors (name, slug, category_id, code, degree_type, duration, description, career_prospects, courses, skills, status) VALUES
('计算机科学与技术', 'computer-science-and-technology', (SELECT id FROM categories WHERE slug = 'engineering'), '080901', '工学学士', 4, '计算机科学与技术是研究计算机的设计与制造，以及信息获取、表示、存储、处理、传输和利用等方面的理论、方法和技术的一门学科。', '软件开发工程师、系统架构师、数据工程师、人工智能工程师、技术经理等', '["数据结构","算法设计与分析","操作系统","计算机网络","数据库系统","软件工程","人工智能","机器学习"]','["编程能力","逻辑思维","问题解决","持续学习","团队协作"]', 'published'),
('软件工程', 'software-engineering', (SELECT id FROM categories WHERE slug = 'engineering'), '080902', '工学学士', 4, '软件工程是研究大规模软件开发方法、工具和管理的一门工程学科，强调用系统化的方法开发和维护软件。', '软件工程师、项目经理、产品经理、架构师、DevOps工程师等', '["软件工程","面向对象程序设计","软件测试","项目管理","软件架构","需求工程","UML建模"]','["编程开发","系统设计","项目管理","团队协作","沟通协调"]', 'published'),
('电子信息工程', 'electronic-information-engineering', (SELECT id FROM categories WHERE slug = 'engineering'), '080701', '工学学士', 4, '电子信息工程是一门应用现代化技术进行电子信息控制和信息处理的学科，主要研究信息的获取与处理，电子设备与信息系统的设计、开发、应用和集成。', '硬件工程师、嵌入式开发工程师、通信工程师、FPGA工程师、芯片设计工程师等', '["电路分析","模拟电子技术","数字电子技术","信号与系统","通信原理","电磁场与电磁波","数字信号处理"]','["电路设计","编程开发","硬件调试","系统分析","创新思维"]', 'published');
