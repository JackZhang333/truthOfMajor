-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE major_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- profiles 表策略
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- experts 表策略
CREATE POLICY "Approved experts are viewable by everyone" ON experts
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own expert record" ON experts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all experts" ON experts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own expert application" ON experts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expert info" ON experts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all experts" ON experts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- expert_specialties 表策略
CREATE POLICY "Expert specialties are viewable by everyone" ON expert_specialties
  FOR SELECT USING (true);

CREATE POLICY "Experts can manage their specialties" ON expert_specialties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM experts
      WHERE experts.id = expert_specialties.expert_id
      AND experts.user_id = auth.uid()
    )
  );

-- majors 表策略
CREATE POLICY "Published majors are viewable by everyone" ON majors
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage majors" ON majors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- categories 表策略
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- questions 表策略
CREATE POLICY "Public questions are viewable by everyone" ON questions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own private questions" ON questions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert questions" ON questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions" ON questions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions" ON questions
  FOR DELETE USING (auth.uid() = user_id);

-- answers 表策略
CREATE POLICY "Answers are viewable by everyone" ON answers
  FOR SELECT USING (true);

CREATE POLICY "Experts can insert answers" ON answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM experts
      WHERE experts.id = answers.expert_id
      AND experts.user_id = auth.uid()
      AND experts.status = 'approved'
    )
  );

CREATE POLICY "Experts can update own answers" ON answers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM experts
      WHERE experts.id = answers.expert_id
      AND experts.user_id = auth.uid()
    )
  );

-- major_experiences 表策略
CREATE POLICY "Major experiences are viewable by everyone" ON major_experiences
  FOR SELECT USING (true);

CREATE POLICY "Experts can insert their experiences" ON major_experiences
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM experts
      WHERE experts.id = major_experiences.expert_id
      AND experts.user_id = auth.uid()
    )
  );

CREATE POLICY "Experts can update own experiences" ON major_experiences
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM experts
      WHERE experts.id = major_experiences.expert_id
      AND experts.user_id = auth.uid()
    )
  );

-- likes 表策略
CREATE POLICY "Users can view their own likes" ON likes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- notifications 表策略
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 创建处理新用户注册的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
