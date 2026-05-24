export interface Fornecedor {
  id: string;
  nome: string;
  contato?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  criado_em: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria_id?: string;
  categoria?: Categoria;
  unidade: string;
  descricao?: string;
  especificacoes?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface Preco {
  id: string;
  produto_id: string;
  produto?: Produto;
  fornecedor_id: string;
  fornecedor?: Fornecedor;
  preco: number;
  preco_minimo?: number;
  quantidade_minima?: number;
  prazo_entrega_dias?: number;
  observacoes?: string;
  data_atualizacao: string;
  criado_em: string;
  atualizado_em: string;
}

export interface ComparacaoPreco {
  produto: Produto;
  precos: (Preco & {
    fornecedor: Fornecedor;
    isMaisBarato: boolean;
    isMaisCaro: boolean;
    percentualDiferenca: number;
  })[];
  menorPreco: number;
  maiorPreco: number;
  mediaPreco: number;
  economia: number;
}

export type OrdenacaoPreco = 'preco_asc' | 'preco_desc' | 'fornecedor_az' | 'data_atualizacao';

export interface FiltrosProduto {
  categoria_id?: string;
  busca?: string;
  ativo?: boolean;
}
