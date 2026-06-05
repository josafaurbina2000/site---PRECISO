-- ==========================================
-- ESTRUTURA PARA A FASE 4: FEED DE PROBLEMAS E INTEGRAÇÕES
-- Execute este script no editor SQL do Supabase.
-- ==========================================

-- 1. Criação da tabela de Categorias (opcional, mas bom pra filtros se quiser futuramente, usaremos enum em texto por agora)

-- 2. Criação da tabela de Problemas
CREATE TABLE IF NOT EXISTS problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  city text NOT NULL,
  budget text,
  status text NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'cancelled'
  author_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  interested_count int DEFAULT 0
);

-- 3. Criação da tabela de Interessados / Mensagens Iniciais
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  solver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  message text,
  UNIQUE(problem_id, solver_id)
);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- 5. Criar Políticas de Segurança (Policies) para Problems
-- Leitura pública para problemas abertos ou onde o usuário é o autor
CREATE POLICY "Problemas visíveis para todos"
ON problems FOR SELECT 
TO public
USING (true);

-- Apenas o autor pode inserir seus próprios problemas
CREATE POLICY "Usuários podem criar problemas"
ON problems FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Apenas o autor pode atualizar seus problemas
CREATE POLICY "Usuários podem atualizar seus problemas"
ON problems FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Apenas o autor pode deletar seus problemas
CREATE POLICY "Usuários podem deletar seus problemas"
ON problems FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- 6. Criar Políticas de Segurança para Interests
-- Usuários podem ver interesses nos seus problemas ou interesses que eles criaram
CREATE POLICY "Visibilidade de interesses"
ON interests FOR SELECT 
TO authenticated
USING (
  solver_id = auth.uid() OR 
  problem_id IN (SELECT id FROM problems WHERE author_id = auth.uid())
);

-- Apenas Solvers podem criar interesse (não checado na policy do DB diretamente, é na role, mas o front garante)
CREATE POLICY "Criar interesse"
ON interests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = solver_id);

-- 7. Função e Trigger para incrementar o contador de interessados
CREATE OR REPLACE FUNCTION increment_interested_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE problems
  SET interested_count = interested_count + 1
  WHERE id = NEW.problem_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_interest_created
AFTER INSERT ON interests
FOR EACH ROW
EXECUTE FUNCTION increment_interested_count();

CREATE OR REPLACE FUNCTION decrement_interested_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE problems
  SET interested_count = interested_count - 1
  WHERE id = OLD.problem_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_interest_deleted
AFTER DELETE ON interests
FOR EACH ROW
EXECUTE FUNCTION decrement_interested_count();
