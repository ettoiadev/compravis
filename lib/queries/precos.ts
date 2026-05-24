import { createClient } from '@/lib/supabase/client';
import { calcularPercentualDiferenca } from '@/lib/utils/formatters';
import type { Preco, ComparacaoPreco, Fornecedor } from '@/types';

export async function getPrecosPorProduto(produtoId: string) {


  const supabase = createClient();
  const { data, error } = await supabase
    .from('precos')
    .select('*, fornecedor:fornecedores(*), produto:produtos(*)')
    .eq('produto_id', produtoId)
    .order('preco', { ascending: true });
  if (error) throw error;
  return data as Preco[];
}

export async function getComparacaoPorProduto(produtoId: string): Promise<ComparacaoPreco | null> {


  const supabase = createClient();

  // Get product info
  const { data: produto, error: produtoError } = await supabase
    .from('produtos')
    .select('*, categoria:categorias(*)')
    .eq('id', produtoId)
    .single();

  if (produtoError || !produto) return null;

  // Get prices with supplier info
  const { data: precos, error: precosError } = await supabase
    .from('precos')
    .select('*, fornecedor:fornecedores(*)')
    .eq('produto_id', produtoId)
    .order('preco', { ascending: true });

  if (precosError || !precos || precos.length === 0) {
    return {
      produto,
      precos: [],
      menorPreco: 0,
      maiorPreco: 0,
      mediaPreco: 0,
      economia: 0,
    };
  }

  const valores = precos.map((p) => p.preco);
  const menorPreco = Math.min(...valores);
  const maiorPreco = Math.max(...valores);
  const mediaPreco = valores.reduce((a, b) => a + b, 0) / valores.length;
  const economia = maiorPreco - menorPreco;

  const precosComInfo = precos.map((p) => ({
    ...p,
    fornecedor: p.fornecedor as Fornecedor,
    isMaisBarato: p.preco === menorPreco,
    isMaisCaro: p.preco === maiorPreco && precos.length > 1,
    percentualDiferenca: calcularPercentualDiferenca(p.preco, menorPreco),
  }));

  return {
    produto,
    precos: precosComInfo,
    menorPreco,
    maiorPreco,
    mediaPreco,
    economia,
  };
}

export async function criarPreco(preco: Omit<Preco, 'id' | 'criado_em' | 'atualizado_em' | 'produto' | 'fornecedor'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('precos')
    .insert(preco)
    .select('*, fornecedor:fornecedores(*), produto:produtos(*)')
    .single();
  if (error) throw error;
  return data as Preco;
}

export async function atualizarPreco(id: string, preco: Partial<Preco>) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { fornecedor, produto, ...precoSemRelacoes } = preco as Preco;
  const { data, error } = await supabase
    .from('precos')
    .update({
      ...precoSemRelacoes,
      data_atualizacao: new Date().toISOString().split('T')[0],
    })
    .eq('id', id)
    .select('*, fornecedor:fornecedores(*), produto:produtos(*)')
    .single();
  if (error) throw error;
  return data as Preco;
}

export async function excluirPreco(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('precos')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getPrecosPorFornecedor(fornecedorId: string) {


  const supabase = createClient();
  const { data, error } = await supabase
    .from('precos')
    .select('*, produto:produtos(*, categoria:categorias(*))')
    .eq('fornecedor_id', fornecedorId)
    .order('data_atualizacao', { ascending: false });
  if (error) throw error;
  return data as Preco[];
}

export async function getTodosOsPrecos() {


  const supabase = createClient();
  const { data, error } = await supabase
    .from('precos')
    .select('*, fornecedor:fornecedores(*), produto:produtos(*, categoria:categorias(*))')
    .order('data_atualizacao', { ascending: false });
  if (error) throw error;
  return data as Preco[];
}
