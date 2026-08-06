-- Rode este script UMA VEZ no Supabase: seu projeto > SQL Editor > New query > colar e Run.

-- Tabela das duas pessoas e seus cursos
create table if not exists people (
  id text primary key,
  name text not null,
  course_id text not null
);

-- Tabela do histórico de temas sorteados
create table if not exists history (
  id uuid primary key default gen_random_uuid(),
  person_id text not null references people(id) on delete cascade,
  course_id text not null,
  theme text not null,
  date timestamptz not null default now(),
  done boolean not null default false
);

-- Dados iniciais (ajuste os nomes se quiser, ou edite depois pelo próprio site)
insert into people (id, name, course_id) values
  ('p1', 'Douglas', 'cc'),
  ('p2', 'Priscilla', 'direito')
on conflict (id) do nothing;

-- Habilita Row Level Security (obrigatório no Supabase)
alter table people enable row level security;
alter table history enable row level security;

-- Como é um app privado só para vocês dois (a chave anon não é divulgada
-- publicamente em lugar nenhum, só embutida no site), liberamos acesso
-- total de leitura/escrita para quem tiver essa chave.
create policy "public read people" on people for select using (true);
create policy "public update people" on people for update using (true);
create policy "public insert people" on people for insert with check (true);

create policy "public read history" on history for select using (true);
create policy "public insert history" on history for insert with check (true);
create policy "public update history" on history for update using (true);
create policy "public delete history" on history for delete using (true);

-- Liga o Realtime nas duas tabelas, para as mudanças aparecerem
-- automaticamente no navegador do outro, sem precisar recarregar a página.
alter publication supabase_realtime add table people;
alter publication supabase_realtime add table history;
