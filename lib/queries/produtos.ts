import { createClient } from '@/lib/supabase/client';
import type { Produto, Categoria } from '@/types';

export async function getCategorias() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('SEU_PROJETO')) {
    const { mockCategorias } = await import('@/lib/mock-data');
    return mockCategorias;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nome', { ascending: true });
  if (error) throw error;
  return data as Categoria[];
}

export async function criarCategoria(categoria: Omit<Categoria, 'id' | 'criado_em'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categorias')
    .insert(categoria)
    .select()
    .single();
  if (error) throw error;
  return data as Categoria;
}

export async function atualizarCategoria(id: string, categoria: Partial<Categoria>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categorias')
    .update(categoria)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Categoria;
}

export async function excluirCategoria(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getProdutos(filtros?: { categoria_id?: string; busca?: string; ativo?: boolean }) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('SEU_PROJETO')) {
    const { mockProdutos } = await import('@/lib/mock-data');
    let resultado = mockProdutos;
    if (filtros?.categoria_id) resultado = resultado.filter(p => p.categoria_id === filtros.categoria_id);
    if (filtros?.ativo !== undefined) resultado = resultado.filter(p => p.ativo === filtros.ativo);
    if (filtros?.busca) {
      const b = filtros.busca.toLowerCase();
      resultado = resultado.filter(p => p.nome.toLowerCase().includes(b));
    }
    return resultado;
  }

  const supabase = createClient();
  let query = supabase
    .from('produtos')
    .select('*, categoria:categorias(*)')
    .order('nome', { ascending: true });

  if (filtros?.categoria_id) {
    query = query.eq('categoria_id', filtros.categoria_id);
  }
  if (filtros?.ativo !== undefined) {
    query = query.eq('ativo', filtros.ativo);
  }
  if (filtros?.busca) {
    query = query.or(`nome.ilike.%${filtros.busca}%,especificacoes.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Produto[];
}

export async function getProdutoById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('produtos')
    .select('*, categoria:categorias(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Produto;
}

export async function buscarProdutos(busca: string) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('SEU_PROJETO')) {
    const { mockProdutos } = await import('@/lib/mock-data');
    return mockProdutos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('produtos')
    .select('*, categoria:categorias(*)')
    .eq('ativo', true)
    .or(`nome.ilike.%${busca}%,especificacoes.ilike.%${busca}%,descricao.ilike.%${busca}%`)
    .order('nome', { ascending: true })
    .limit(20);
  if (error) throw error;
  return data as Produto[];
}

export async function criarProduto(produto: Omit<Produto, 'id' | 'criado_em' | 'atualizado_em' | 'categoria'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('produtos')
    .insert(produto)
    .select('*, categoria:categorias(*)')
    .single();
  if (error) throw error;
  return data as Produto;
}

export async function atualizarProduto(id: string, produto: Partial<Produto>) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categoria, ...produtoSemCategoria } = produto as Produto;
  const { data, error } = await supabase
    .from('produtos')
    .update(produtoSemCategoria)
    .eq('id', id)
    .select('*, categoria:categorias(*)')
    .single();
  if (error) throw error;
  return data as Produto;
}

export async function excluirProduto(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function contarFornecedoresDoProduto(produtoId: string): Promise<number> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('SEU_PROJETO')) {
    const { mockPrecos } = await import('@/lib/mock-data');
    return mockPrecos.filter(p => p.produto_id === produtoId).length;
  }

  const supabase = createClient();
  const { count, error } = await supabase
    .from('precos')
    .select('*', { count: 'exact', head: true })
    .eq('produto_id', produtoId);
  if (error) return 0;
  return count ?? 0;
}
