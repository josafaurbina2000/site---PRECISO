-- Schema definitions for Problemas page and Proposals

-- Create proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    solver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    estimated_time VARCHAR NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(problem_id, solver_id) -- Regra: Um usuário pode possuir apenas UMA proposta por problema
);

-- Habilitar RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Permitir select: o autor do problema pode ver todas as propostas. O usuário que enviou pode ver a sua própria.
DROP POLICY IF EXISTS "Users can view proposals for their problems or their own propos" ON public.proposals;
DROP POLICY IF EXISTS "View proposals for own problems or own proposals" ON public.proposals;
CREATE POLICY "View proposals for own problems or own proposals"
    ON public.proposals FOR SELECT
    USING (
        auth.uid() = solver_id OR 
        auth.uid() IN (SELECT author_id FROM public.problems WHERE id = problem_id)
    );

-- Permitir insert: qualquer usuário logado pode enviar uma proposta
DROP POLICY IF EXISTS "Users can insert their own proposals" ON public.proposals;
CREATE POLICY "Users can insert their own proposals"
    ON public.proposals FOR INSERT
    WITH CHECK (auth.uid() = solver_id);

-- Permitir update: usuário logado pode atualizar sua própria proposta
DROP POLICY IF EXISTS "Users can update their own proposals" ON public.proposals;
CREATE POLICY "Users can update their own proposals"
    ON public.proposals FOR UPDATE
    USING (auth.uid() = solver_id)
    WITH CHECK (auth.uid() = solver_id);

-- Permitir update do autor do problema para aceitar/rejeitar
DROP POLICY IF EXISTS "Authors can update proposals for their problems" ON public.proposals;
CREATE POLICY "Authors can update proposals for their problems"
    ON public.proposals FOR UPDATE
    USING (auth.uid() IN (SELECT author_id FROM public.problems WHERE id = problem_id))
    WITH CHECK (auth.uid() IN (SELECT author_id FROM public.problems WHERE id = problem_id));

-- Trigger para manter updated_at da proposals
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_proposals_updated_at ON public.proposals;
CREATE TRIGGER update_proposals_updated_at
    BEFORE UPDATE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Update problems table status if needed
-- We assume it already has a status column like 'open', 'em andamento', etc.
-- Ex: ALTER TABLE public.problems ADD COLUMN status VARCHAR DEFAULT 'open';

-- Trigger to update interested_count on problems table
CREATE OR REPLACE FUNCTION update_problem_interested_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.problems SET interested_count = COALESCE(interested_count, 0) + 1 WHERE id = NEW.problem_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.problems SET interested_count = COALESCE(interested_count, 0) - 1 WHERE id = OLD.problem_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_interested_count ON public.proposals;
CREATE TRIGGER trigger_update_interested_count
    AFTER INSERT OR DELETE ON public.proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_problem_interested_count();

