import FornecedoresClient from './client-page';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function FornecedoresPage() {
  try {
    const supabase = await createClient();

    // Buscar fornecedores
    const { data: fornecedores, error: errFornec } = await supabase
      .from('fornecedores')
      .select('*')
      .order('nome', { ascending: true });

    if (errFornec) throw new Error(errFornec.message);

    // Buscar contagem de precos
    const { data: precos, error: errPrecos } = await supabase
      .from('precos')
      .select('fornecedor_id');

    if (errPrecos) throw new Error(errPrecos.message);

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
  } catch (error: any) {
    return (
      <div className="p-8 mt-16 max-w-7xl mx-auto w-full text-center">
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-2">Erro de Servidor (Fornecedores)</h2>
          <p className="font-mono text-sm">{error?.message || String(error)}</p>
        </div>
      </div>
    );
  }
}
