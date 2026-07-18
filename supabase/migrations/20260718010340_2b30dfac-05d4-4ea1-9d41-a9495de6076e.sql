-- Threads
CREATE TABLE public.agent_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Novo projeto',
  brief_summary TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.agent_threads (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_threads TO authenticated;
GRANT ALL ON public.agent_threads TO service_role;
ALTER TABLE public.agent_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own threads select" ON public.agent_threads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own threads insert" ON public.agent_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own threads update" ON public.agent_threads FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own threads delete" ON public.agent_threads FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER update_agent_threads_updated_at BEFORE UPDATE ON public.agent_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Messages
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.agent_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.agent_messages (thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_messages TO authenticated;
GRANT ALL ON public.agent_messages TO service_role;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages select" ON public.agent_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agent_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "own messages insert" ON public.agent_messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.agent_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "own messages delete" ON public.agent_messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agent_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));

-- Reports
CREATE TABLE public.agent_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL UNIQUE REFERENCES public.agent_threads(id) ON DELETE CASCADE,
  business JSONB NOT NULL DEFAULT '{}'::jsonb,
  brand JSONB NOT NULL DEFAULT '{}'::jsonb,
  audience JSONB NOT NULL DEFAULT '{}'::jsonb,
  design_system JSONB NOT NULL DEFAULT '{}'::jsonb,
  section_map JSONB NOT NULL DEFAULT '[]'::jsonb,
  implementation_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_reports TO authenticated;
GRANT ALL ON public.agent_reports TO service_role;
ALTER TABLE public.agent_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own report select" ON public.agent_reports FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agent_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "own report upsert" ON public.agent_reports FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.agent_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE POLICY "own report update" ON public.agent_reports FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.agent_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.agent_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE TRIGGER update_agent_reports_updated_at BEFORE UPDATE ON public.agent_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();