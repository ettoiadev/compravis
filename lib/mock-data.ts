import type { Categoria, Produto, Fornecedor, Preco } from '@/types';

export const mockCategorias: Categoria[] = [
  { id: 'cat1', nome: 'Lonas', descricao: 'Lonas para impressão digital', criado_em: new Date().toISOString() },
  { id: 'cat2', nome: 'Adesivos Vinil', descricao: 'Adesivos para recorte e impressão', criado_em: new Date().toISOString() },
  { id: 'cat3', nome: 'Chapas Rígidas', descricao: 'Acrílico, PVC Expandido, PS', criado_em: new Date().toISOString() },
  { id: 'cat4', nome: 'Tintas e Insumos', descricao: 'Tintas base solvente e UV', criado_em: new Date().toISOString() },
];

export const mockProdutos: Produto[] = [
  { id: 'prod1', nome: 'Lona Frontlight 440g Brilho 3,20m', categoria_id: 'cat1', unidade: 'Rolo 50m', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), categoria: mockCategorias[0] },
  { id: 'prod2', nome: 'Lona Backlight 500g Fosca 2,50m', categoria_id: 'cat1', unidade: 'Rolo 50m', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), categoria: mockCategorias[0] },
  { id: 'prod3', nome: 'Adesivo Vinil Branco Brilho 1,22m', categoria_id: 'cat2', unidade: 'Rolo 50m', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), categoria: mockCategorias[1] },
  { id: 'prod4', nome: 'Adesivo Vinil Transparente 1,06m', categoria_id: 'cat2', unidade: 'Rolo 50m', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), categoria: mockCategorias[1] },
  { id: 'prod5', nome: 'Chapa de PS Branco 2mm 1,22x2,44m', categoria_id: 'cat3', unidade: 'Chapa', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), categoria: mockCategorias[2] },
  { id: 'prod6', nome: 'Chapa Acrílico Cristal 3mm 1,22x2,44m', categoria_id: 'cat3', unidade: 'Chapa', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), categoria: mockCategorias[2] },
  { id: 'prod7', nome: 'Tinta Eco Solvente Cyan 1L', categoria_id: 'cat4', unidade: 'Litro', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), categoria: mockCategorias[3] },
];

export const mockFornecedores: Fornecedor[] = [
  { id: 'forn1', nome: 'VinilSul', contato: 'Carlos Roberto', telefone: '(11) 98888-1111', email: 'vendas@vinilsul.exemplo.com', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString() },
  { id: 'forn2', nome: 'Serilon', contato: 'Ana Maria', telefone: '(11) 97777-2222', email: 'contato@serilon.exemplo.com', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString() },
  { id: 'forn3', nome: 'Sign Supply', contato: 'Pedro Paulo', telefone: '(11) 96666-3333', email: 'vendas@signsupply.exemplo.com', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString() },
  { id: 'forn4', nome: 'Day Brasil', contato: 'Fernanda', telefone: '(11) 95555-4444', email: 'vendas@daybrasil.exemplo.com', ativo: true, criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString() },
];

export const mockPrecos: Preco[] = [
  { id: 'prec1', produto_id: 'prod1', fornecedor_id: 'forn1', preco: 1250.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[0], fornecedor: mockFornecedores[0] },
  { id: 'prec2', produto_id: 'prod1', fornecedor_id: 'forn2', preco: 1300.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[0], fornecedor: mockFornecedores[1] },
  { id: 'prec3', produto_id: 'prod1', fornecedor_id: 'forn3', preco: 1280.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[0], fornecedor: mockFornecedores[2] },

  { id: 'prec4', produto_id: 'prod3', fornecedor_id: 'forn1', preco: 450.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[2], fornecedor: mockFornecedores[0] },
  { id: 'prec5', produto_id: 'prod3', fornecedor_id: 'forn2', preco: 430.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[2], fornecedor: mockFornecedores[1] },
  { id: 'prec6', produto_id: 'prod3', fornecedor_id: 'forn4', preco: 460.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[2], fornecedor: mockFornecedores[3] },

  { id: 'prec7', produto_id: 'prod5', fornecedor_id: 'forn1', preco: 85.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[4], fornecedor: mockFornecedores[0] },
  { id: 'prec8', produto_id: 'prod5', fornecedor_id: 'forn2', preco: 88.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[4], fornecedor: mockFornecedores[1] },
  { id: 'prec9', produto_id: 'prod5', fornecedor_id: 'forn4', preco: 82.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[4], fornecedor: mockFornecedores[3] },
  
  { id: 'prec10', produto_id: 'prod7', fornecedor_id: 'forn3', preco: 145.00, data_atualizacao: new Date().toISOString(), criado_em: new Date().toISOString(), atualizado_em: new Date().toISOString(), produto: mockProdutos[6], fornecedor: mockFornecedores[2] },
];
