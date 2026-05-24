import FornecedoresClient from './client-page';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function FornecedoresPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Buscar fornecedores
  const { data: fornecedores } = await supabase
    .from('fornecedores')
    .select('*')
    .order('nome', { ascending: true });

  // Buscar contagem de precos
  const { data: precos } = await supabase
    .from('precos')
    .select('fornecedor_id');

  const contagem: Record<string, number> = {};
  if (precos) {
    for (const p of precos) {
      contagem[p.fornecedor_id] = (contagem[p.fornecedor_id] || 0) + 1;
    }
  }

  return (
    <FornecedoresClient 
      initialFornecedores={fornecedores || []} 
      initialContagem={contagem} 
    />
  );
}
