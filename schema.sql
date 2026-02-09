-- ==========================================
-- منصة معهد العباسية - الكود النهائي المؤمن
-- ==========================================

-- 1. تنظيف شامل
DROP TABLE IF EXISTS results, schedules, lectures, news, sessions, students, departments CASCADE;
DROP FUNCTION IF EXISTS authenticate_student(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS verify_session(TEXT) CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. الجداول
CREATE TABLE departments (
    id SERIAL PRIMARY KEY, 
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    national_id TEXT NOT NULL UNIQUE,
    student_code TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    is_admin BOOLEAN DEFAULT FALSE,
    department_id INTEGER REFERENCES departments(id),
    year INTEGER CHECK (year BETWEEN 1 AND 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE news (
    id SERIAL PRIMARY KEY, 
    title TEXT NOT NULL, 
    content TEXT NOT NULL, 
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lectures (
    id SERIAL PRIMARY KEY, 
    title TEXT NOT NULL, 
    description TEXT, 
    video_url TEXT,
    file_url TEXT,
    department_id INTEGER REFERENCES departments(id), 
    year INTEGER, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY, 
    day TEXT NOT NULL, 
    subject TEXT NOT NULL, 
    start_time TIME, 
    end_time TIME, 
    room TEXT,
    department_id INTEGER REFERENCES departments(id), 
    year INTEGER
);

CREATE TABLE results (
    id SERIAL PRIMARY KEY, 
    student_id UUID REFERENCES students(id) ON DELETE CASCADE, 
    subject TEXT NOT NULL, 
    score INTEGER, 
    max_score INTEGER DEFAULT 100,
    semester INTEGER DEFAULT 1
);

-- 3. بيانات تجريبية (أقسام)
INSERT INTO departments (name) VALUES 
('نظم معلومات الأعمال (BIS)'), 
('محاسبة'), 
('إدارة');

-- طالب تجريبي (الرقم القومي: 12345678901234 | الكود: 2024)
INSERT INTO students (full_name, national_id, student_code, password_hash, department_id, year, is_admin)
VALUES ('طالب تجريبي', '12345678901234', '2024', crypt('2024', gen_salt('bf')), 1, 1, false);

-- بيانات تجريبية للمحتوى
INSERT INTO news (title, content, image_url) VALUES 
('بداية العام الدراسي', 'نرحب بطلاب معهد العباسية في العام الدراسي الجديد 2024/2025.', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'),
('جدول الامتحانات', 'تم صدور جدول امتحانات الميدتيرم لجميع الفرق الدراسية.', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800');

INSERT INTO lectures (title, description, department_id, year, video_url) VALUES 
('مقدمة في نظم المعلومات', 'شرح أساسيات نظم المعلومات الإدارية.', 1, 1, 'https://www.youtube.com/watch?v=rfscVS0vtbw'),
('المحاسبة المالية 1', 'مبادئ المحاسبة والقيد المزدوج.', 2, 1, 'https://www.youtube.com/watch?v=example');

INSERT INTO schedules (day, subject, start_time, end_time, room, department_id, year) VALUES 
('السبت', 'برمجة الحاسب', '09:00', '11:00', 'معمل 1', 1, 1),
('السبت', 'نظم معلومات', '11:00', '13:00', 'قاعة 5', 1, 1),
('الأحد', 'محاسبة مالية', '09:00', '11:00', 'قاعة 2', 2, 1);

INSERT INTO results (student_id, subject, score, max_score, semester)
SELECT id, 'برمجة الحاسب', 85, 100, 1 FROM students WHERE national_id = '12345678901234';
INSERT INTO results (student_id, subject, score, max_score, semester)
SELECT id, 'نظم معلومات', 92, 100, 1 FROM students WHERE national_id = '12345678901234';

-- 4. الدوال المؤمنة (SECURITY DEFINER)
-- أسماء المعاملات p_id و p_code لتطابق LoginPage.jsx
CREATE OR REPLACE FUNCTION authenticate_student(p_id TEXT, p_code TEXT)
RETURNS TABLE(r_success BOOLEAN, r_token TEXT, r_name TEXT) AS $$
DECLARE
    v_id UUID; v_name TEXT; v_hash TEXT; v_token TEXT;
BEGIN
    SELECT id, full_name, password_hash INTO v_id, v_name, v_hash FROM students WHERE national_id = p_id;
    IF v_id IS NOT NULL AND v_hash = crypt(p_code, v_hash) THEN
        v_token := encode(gen_random_bytes(32), 'hex');
        -- حذف الجلسات القديمة
        DELETE FROM sessions WHERE student_id = v_id;
        INSERT INTO sessions (student_id, token, expires_at) VALUES (v_id, v_token, NOW() + INTERVAL '7 days');
        RETURN QUERY SELECT TRUE, v_token, v_name;
    ELSE
        RETURN QUERY SELECT FALSE, NULL::TEXT, NULL::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- اسم المعامل p_token لتطابق App.jsx
CREATE OR REPLACE FUNCTION verify_session(p_token TEXT)
RETURNS TABLE(r_id UUID, r_name TEXT, r_role TEXT, r_admin BOOLEAN, r_dept INTEGER, r_year INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.full_name, s.role, s.is_admin, s.department_id, s.year
    FROM sessions ses JOIN students s ON s.id = ses.student_id
    WHERE ses.token = p_token AND ses.expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. تفعيل الأمان (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول (القراءة فقط للمسجلين أو الجميع)
CREATE POLICY "Public Read" ON departments FOR SELECT USING (true);
CREATE POLICY "Public Read" ON news FOR SELECT USING (true);
CREATE POLICY "Student Read" ON lectures FOR SELECT USING (true);
CREATE POLICY "Student Read" ON schedules FOR SELECT USING (true);
CREATE POLICY "Student Read" ON results FOR SELECT USING (true);

-- صلاحيات الجداول
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON departments, news, lectures, schedules, results TO anon, authenticated;
GRANT INSERT, DELETE, SELECT ON sessions TO anon, authenticated;

-- صلاحيات تنفيذ الدوال
GRANT EXECUTE ON FUNCTION authenticate_student, verify_session TO anon, authenticated;
