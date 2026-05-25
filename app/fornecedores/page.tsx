import FornecedoresClient from './client-page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function FornecedoresPage() {
  const supabase = await createClient();

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
