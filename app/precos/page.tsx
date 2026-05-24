import PrecosClient from './client-page';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function PrecosPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Buscar todos os precos
  const { data: precos } = await supabase
    .from('precos')
    .select('*, fornecedor:fornecedores(*), produto:produtos(*, categoria:categorias(*))')
    .order('data_atualizacao', { ascending: false });

  // Buscar produtos
  const { data: produtos } = await supabase
    .from('produtos')
    .select('*, categoria:categorias(*)')
    .order('nome', { ascending: true });

  // Buscar fornecedores
  const { data: fornecedores } = await supabase
    .from('fornecedores')
    .select('*')
    .order('nome', { ascending: true });

  return (
    <PrecosClient 
      initialPrecos={precos || []} 
      initialProdutos={produtos || []} 
      initialFornecedores={fornecedores || []} 
    />
  );
}
