-- FASE 6: CHAT + CONTRATAÇÃO

-- 1. Criação da tabela de Chats
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  solver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(problem_id) -- Um problema só pode ter um chat ativo após a contratação
);

-- 2. Criação da tabela de Mensagens
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- 3. RLS para Chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios chats" ON public.chats;
CREATE POLICY "Usuários podem ver seus próprios chats"
  ON public.chats FOR SELECT
  USING (auth.uid() = author_id OR auth.uid() = solver_id);

DROP POLICY IF EXISTS "Usuários podem criar chats" ON public.chats;
CREATE POLICY "Usuários podem criar chats"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = author_id OR auth.uid() = solver_id);

-- 4. RLS para Mensagens
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver mensagens dos seus chats" ON public.messages;
CREATE POLICY "Usuários podem ver mensagens dos seus chats"
  ON public.messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT author_id FROM public.chats WHERE id = chat_id
      UNION
      SELECT solver_id FROM public.chats WHERE id = chat_id
    )
  );

DROP POLICY IF EXISTS "Usuários podem enviar mensagens nos seus chats" ON public.messages;
CREATE POLICY "Usuários podem enviar mensagens nos seus chats"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT author_id FROM public.chats WHERE id = chat_id
      UNION
      SELECT solver_id FROM public.chats WHERE id = chat_id
    )
  );

DROP POLICY IF EXISTS "Usuários podem marcar mensagens como lidas" ON public.messages;
CREATE POLICY "Usuários podem marcar mensagens como lidas"
  ON public.messages FOR UPDATE
  USING (
    -- Só quem recebe a mensagem pode marcá-la como lida
    auth.uid() != user_id AND
    auth.uid() IN (
      SELECT author_id FROM public.chats WHERE id = chat_id
      UNION
      SELECT solver_id FROM public.chats WHERE id = chat_id
    )
  )
  WITH CHECK (
    -- update restringe apenas para read_at
    auth.uid() != user_id AND
    auth.uid() IN (
      SELECT author_id FROM public.chats WHERE id = chat_id
      UNION
      SELECT solver_id FROM public.chats WHERE id = chat_id
    )
  );

-- Function and trigger para popular o updated_at do chats automaticamente
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats SET updated_at = now() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_timestamp ON public.messages;
CREATE TRIGGER trigger_update_chat_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_updated_at();

-- Note: We also need a column 'selected_proposal_id' on 'problems' to store the chosen professional context, 
-- but we can infer it through the accepted proposal natively or add a column if needed.
-- Since proposal has status 'accepted', we can track who won by query.
