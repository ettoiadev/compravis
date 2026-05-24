import { createClient } from '@/lib/supabase/client';
import type { Fornecedor } from '@/types';

export async function getFornecedores(apenasAtivos = false) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('SEU_PROJETO')) {
    const { mockFornecedores } = await import('@/lib/mock-data');
    let resultado = mockFornecedores;
    if (apenasAtivos) {
      resultado = resultado.filter(f => f.ativo);
    }
    return resultado;
  }

  const supabase = createClient();
  let query = supabase
    .from('fornecedores')
    .select('*')
    .order('nome', { ascending: true });

  if (apenasAtivos) {
    query = query.eq('ativo', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Fornecedor[];
}

export async function getFornecedorById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Fornecedor;
}

export async function criarFornecedor(fornecedor: Omit<Fornecedor, 'id' | 'criado_em' | 'atualizado_em'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('fornecedores')
    .insert(fornecedor)
    .select()
    .single();
  if (error) throw error;
  return data as Fornecedor;
}

export async function atualizarFornecedor(id: string, fornecedor: Partial<Fornecedor>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('fornecedores')
    .update(fornecedor)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Fornecedor;
}

export async function excluirFornecedor(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('fornecedores')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function contarPrecosDoFornecedor(fornecedorId: string): Promise<number> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('SEU_PROJETO')) {
    const { mockPrecos } = await import('@/lib/mock-data');
    return mockPrecos.filter(p => p.fornecedor_id === fornecedorId).length;
  }

  const supabase = createClient();
  const { count, error } = await supabase
    .from('precos')
    .select('*', { count: 'exact', head: true })
    .eq('fornecedor_id', fornecedorId);
  if (error) return 0;
  return count ?? 0;
}
