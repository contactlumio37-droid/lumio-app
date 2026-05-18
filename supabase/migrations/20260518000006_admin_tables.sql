-- Table feedbacks (panel admin)
CREATE TABLE public.feedbacks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type       TEXT,
  text       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done')),
  response   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedbacks_created ON public.feedbacks(created_at DESC);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedbacks; read/update reserved for service_role
CREATE POLICY "feedbacks_insert_own" ON public.feedbacks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "feedbacks_select_own" ON public.feedbacks
  FOR SELECT USING (user_id = auth.uid());

-- Table roadmap (panel admin — lecture publique, écriture service_role)
CREATE TABLE public.roadmap (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  description TEXT,
  status     TEXT NOT NULL DEFAULT 'soon' CHECK (status IN ('soon','in_progress','done')),
  votes      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_roadmap_status ON public.roadmap(status);

ALTER TABLE public.roadmap ENABLE ROW LEVEL SECURITY;

-- Lecture publique pour tous les utilisateurs connectés
CREATE POLICY "roadmap_select_authenticated" ON public.roadmap
  FOR SELECT USING (auth.role() = 'authenticated');
