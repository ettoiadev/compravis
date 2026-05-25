import ProdutosClient from './client-page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProdutosPage() {
  try {
    const supabase = await createClient();

    // Buscar produtos
    const { data: produtos, error: errProdutos } = await supabase
      .from('produtos')
      .select('*, categoria:categorias(*)')
      .order('nome', { ascending: true });

    if (errProdutos) throw new Error(errProdutos.message);

    // Buscar categorias
    const { data: categorias, error: errCategorias } = await supabase
      .from('categorias')
      .select('*')
      .order('nome', { ascending: true });

    if (errCategorias) throw new Error(errCategorias.message);

    const { data: precos, error: errPrecos } = await supabase
      .from('precos')
      .select('produto_id');

    if (errPrecos) throw new Error(errPrecos.message);

    const contagem: Record<string, number> = {};
    if (precos) {
      for (const p of precos) {
        contagem[p.produto_id] = (contagem[p.produto_id] || 0) + 1;
      }
    }

    return (
      <ProdutosClient 
        initialProdutos={produtos || []} 
        initialCategorias={categorias || []} 
        initialContagem={contagem} 
      />
    );
  } catch (error: any) {
    return (
      <div className="p-8 mt-16 max-w-7xl mx-auto w-full text-center">
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">Erro de Servidor (Produtos)</h2>
          <p className="font-mono text-sm">{error?.message || String(error)}</p>
        </div>
      </div>
    );
  }
}
