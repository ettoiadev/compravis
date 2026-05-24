-- Script de inicialização do banco de dados CompraVis
-- Copie e cole este código no SQL Editor do seu painel Supabase e execute.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS categorias (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  criado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fornecedores (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome text NOT NULL,
  contato text,
  telefone text,
  email text,
  observacoes text,
  ativo boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS produtos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome text NOT NULL,
  categoria_id uuid REFERENCES categorias(id) ON DELETE SET NULL,
  unidade text NOT NULL DEFAULT 'unidade',
  descricao text,
  especificacoes text,
  ativo boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS precos (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  produto_id uuid NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  fornecedor_id uuid NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
  preco numeric NOT NULL,
  preco_minimo numeric,
  quantidade_minima integer,
  prazo_entrega_dias integer,
  observacoes text,
  data_atualizacao timestamp with time zone DEFAULT now(),
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now()
);

-- Habilitar RLS (Row Level Security) e policies liberais para desenvolvimento
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE precos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions" ON categorias FOR ALL USING (true);
CREATE POLICY "Allow all actions" ON fornecedores FOR ALL USING (true);
CREATE POLICY "Allow all actions" ON produtos FOR ALL USING (true);
CREATE POLICY "Allow all actions" ON precos FOR ALL USING (true);

-- Inserir dados mockados (usando UUIDs fixos para facilitar relações)
INSERT INTO categorias (id, nome, descricao) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Lonas', 'Lonas para impressão digital'),
('c0000000-0000-0000-0000-000000000002', 'Adesivos Vinil', 'Adesivos para recorte e impressão'),
('c0000000-0000-0000-0000-000000000003', 'Chapas Rígidas', 'Acrílico, PVC Expandido, PS'),
('c0000000-0000-0000-0000-000000000004', 'Tintas e Insumos', 'Tintas base solvente e UV')
ON CONFLICT (id) DO NOTHING;

INSERT INTO fornecedores (id, nome, contato, telefone, email) VALUES 
('f0000000-0000-0000-0000-000000000001', 'VinilSul', 'Carlos Roberto', '(11) 98888-1111', 'vendas@vinilsul.exemplo.com'),
('f0000000-0000-0000-0000-000000000002', 'Serilon', 'Ana Maria', '(11) 97777-2222', 'contato@serilon.exemplo.com'),
('f0000000-0000-0000-0000-000000000003', 'Sign Supply', 'Pedro Paulo', '(11) 96666-3333', 'vendas@signsupply.exemplo.com'),
('f0000000-0000-0000-0000-000000000004', 'Day Brasil', 'Fernanda', '(11) 95555-4444', 'vendas@daybrasil.exemplo.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO produtos (id, nome, categoria_id, unidade) VALUES 
('d0000000-0000-0000-0000-000000000001', 'Lona Frontlight 440g Brilho 3,20m', 'c0000000-0000-0000-0000-000000000001', 'Rolo 50m'),
('d0000000-0000-0000-0000-000000000002', 'Lona Backlight 500g Fosca 2,50m', 'c0000000-0000-0000-0000-000000000001', 'Rolo 50m'),
('d0000000-0000-0000-0000-000000000003', 'Adesivo Vinil Branco Brilho 1,22m', 'c0000000-0000-0000-0000-000000000002', 'Rolo 50m'),
('d0000000-0000-0000-0000-000000000005', 'Chapa de PS Branco 2mm 1,22x2,44m', 'c0000000-0000-0000-0000-000000000003', 'Chapa'),
('d0000000-0000-0000-0000-000000000007', 'Tinta Eco Solvente Cyan 1L', 'c0000000-0000-0000-0000-000000000004', 'Litro')
ON CONFLICT (id) DO NOTHING;

INSERT INTO precos (id, produto_id, fornecedor_id, preco) VALUES 
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1250.00),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 1300.00),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 450.00),
('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000003', 85.00)
ON CONFLICT (id) DO NOTHING;
