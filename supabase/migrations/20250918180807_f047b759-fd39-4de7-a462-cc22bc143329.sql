-- Create enum types for better data consistency
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.project_status AS ENUM ('planning', 'in_progress', 'completed', 'on_hold');
CREATE TYPE public.dataset_format AS ENUM ('csv', 'json', 'parquet', 'xlsx', 'sql', 'other');
CREATE TYPE public.event_type AS ENUM ('workshop', 'webinar', 'meetup', 'conference', 'hackathon');
CREATE TYPE public.enrollment_status AS ENUM ('enrolled', 'completed', 'dropped', 'in_progress');

-- Courses table for educational content
CREATE TABLE public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT, -- Course content/curriculum
    instructor_id UUID NOT NULL REFERENCES public.profiles(id),
    level course_level NOT NULL DEFAULT 'beginner',
    status course_status NOT NULL DEFAULT 'draft',
    duration_hours INTEGER,
    price DECIMAL(10,2) DEFAULT 0.00,
    thumbnail_url TEXT,
    tags TEXT[],
    prerequisites TEXT[],
    learning_objectives TEXT[],
    is_featured BOOLEAN DEFAULT false,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User course enrollments
CREATE TABLE public.course_enrollments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    course_id UUID NOT NULL REFERENCES public.courses(id),
    status enrollment_status NOT NULL DEFAULT 'enrolled',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id)
);

-- Data Science Projects
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT, -- Project details, methodology, etc
    author_id UUID NOT NULL REFERENCES public.profiles(id),
    status project_status NOT NULL DEFAULT 'planning',
    repository_url TEXT,
    demo_url TEXT,
    thumbnail_url TEXT,
    tags TEXT[],
    technologies TEXT[], -- e.g., ['Python', 'Pandas', 'Scikit-learn']
    industry TEXT, -- e.g., 'Healthcare', 'Finance', 'E-commerce'
    difficulty_level course_level NOT NULL DEFAULT 'beginner',
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Datasets catalog
CREATE TABLE public.datasets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    uploader_id UUID NOT NULL REFERENCES public.profiles(id),
    file_url TEXT,
    file_size BIGINT, -- Size in bytes
    format dataset_format NOT NULL,
    rows_count INTEGER,
    columns_count INTEGER,
    license TEXT DEFAULT 'Unknown',
    source TEXT, -- Original source of the data
    tags TEXT[],
    category TEXT,
    is_public BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tools and Technologies catalog
CREATE TABLE public.technologies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL, -- e.g., 'Programming Language', 'Library', 'Framework', 'Tool'
    website_url TEXT,
    documentation_url TEXT,
    logo_url TEXT,
    tags TEXT[],
    difficulty_level course_level DEFAULT 'beginner',
    popularity_score INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Events for the community
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    organizer_id UUID NOT NULL REFERENCES public.profiles(id),
    event_type event_type NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT, -- Can be physical address or 'Online'
    meeting_url TEXT, -- For online events
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0.00,
    thumbnail_url TEXT,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Event registrations
CREATE TABLE public.event_registrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    event_id UUID NOT NULL REFERENCES public.events(id),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    attended BOOLEAN DEFAULT false,
    UNIQUE(user_id, event_id)
);

-- Project likes/favorites
CREATE TABLE public.project_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    project_id UUID NOT NULL REFERENCES public.projects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, project_id)
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" 
ON public.courses FOR SELECT 
USING (status = 'published' OR auth.uid() = instructor_id);

CREATE POLICY "Instructors can create courses" 
ON public.courses FOR INSERT 
WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their courses" 
ON public.courses FOR UPDATE 
USING (auth.uid() = instructor_id);

-- RLS Policies for course enrollments
CREATE POLICY "Users can view their enrollments" 
ON public.course_enrollments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in courses" 
ON public.course_enrollments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their enrollments" 
ON public.course_enrollments FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for projects
CREATE POLICY "Anyone can view public projects" 
ON public.projects FOR SELECT 
USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "Users can create projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = author_id);

-- RLS Policies for datasets
CREATE POLICY "Anyone can view public datasets" 
ON public.datasets FOR SELECT 
USING (is_public = true OR auth.uid() = uploader_id);

CREATE POLICY "Users can upload datasets" 
ON public.datasets FOR INSERT 
WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Uploaders can update their datasets" 
ON public.datasets FOR UPDATE 
USING (auth.uid() = uploader_id);

-- RLS Policies for technologies
CREATE POLICY "Anyone can view technologies" 
ON public.technologies FOR SELECT 
USING (true);

-- RLS Policies for events
CREATE POLICY "Anyone can view published events" 
ON public.events FOR SELECT 
USING (is_published = true OR auth.uid() = organizer_id);

CREATE POLICY "Users can create events" 
ON public.events FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events" 
ON public.events FOR UPDATE 
USING (auth.uid() = organizer_id);

-- RLS Policies for event registrations
CREATE POLICY "Users can view their registrations" 
ON public.event_registrations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" 
ON public.event_registrations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for project likes
CREATE POLICY "Users can view all likes" 
ON public.project_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can like projects" 
ON public.project_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike projects" 
ON public.project_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at
    BEFORE UPDATE ON public.datasets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_technologies_updated_at
    BEFORE UPDATE ON public.technologies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_level ON public.courses(level);
CREATE INDEX idx_courses_tags ON public.courses USING GIN(tags);

CREATE INDEX idx_projects_author_id ON public.projects(author_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_tags ON public.projects USING GIN(tags);
CREATE INDEX idx_projects_technologies ON public.projects USING GIN(technologies);

CREATE INDEX idx_datasets_uploader_id ON public.datasets(uploader_id);
CREATE INDEX idx_datasets_format ON public.datasets(format);
CREATE INDEX idx_datasets_tags ON public.datasets USING GIN(tags);

CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_type ON public.events(event_type);