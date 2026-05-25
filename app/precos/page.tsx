import PrecosClient from './client-page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PrecosPage() {
  try {
    const supabase = await createClient();

    // Buscar todos os precos
    const { data: precos, error: errPrecos } = await supabase
      .from('precos')
      .select('*, fornecedor:fornecedores(*), produto:produtos(*, categoria:categorias(*))')
      .order('data_atualizacao', { ascending: false });

    if (errPrecos) throw new Error(errPrecos.message);

    // Buscar produtos
    const { data: produtos, error: errProdutos } = await supabase
      .from('produtos')
      .select('*, categoria:categorias(*)')
      .order('nome', { ascending: true });

    if (errProdutos) throw new Error(errProdutos.message);

    // Buscar fornecedores
    const { data: fornecedores, error: errFornecedores } = await supabase
      .from('fornecedores')
      .select('*')
      .order('nome', { ascending: true });

    if (errFornecedores) throw new Error(errFornecedores.message);

    return (
      <PrecosClient 
        initialPrecos={precos || []} 
        initialProdutos={produtos || []} 
        initialFornecedores={fornecedores || []} 
      />
    );
  } catch (error: any) {
    return (
      <div className="p-8 mt-16 max-w-7xl mx-auto w-full text-center">
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">Erro de Servidor (Preços)</h2>
          <p className="font-mono text-sm">{error?.message || String(error)}</p>
        </div>
      </div>
    );
  }
}
