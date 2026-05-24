import ProdutosClient from './client-page';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function ProdutosPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Buscar produtos
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*, categoria:categorias(*)')
    .order('nome', { ascending: true });

  // Buscar categorias
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .order('nome', { ascending: true });

  // Buscar precos para contagem (de forma otimizada para a tabela)
  // Em uma aplicação gigante, isso precisaria ser uma query SQL agregada (RPC).
  // Para evitar limite de busca, vamos pegar os precos e agrupar no JS,
  // ou criar uma RPC no banco. Como não temos a RPC, agregaremos no JS.
  const { data: precos } = await supabase
    .from('precos')
    .select('produto_id');

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
}
