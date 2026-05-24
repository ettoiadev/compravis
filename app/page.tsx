'use client';

import { useState, useCallback } from 'react';
import { BarChart3, Package, Search } from 'lucide-react';
import { Header, PageContent } from '@/components/layout/Header';
import { SeletorProduto } from '@/components/comparador/SeletorProduto';
import { TabelaComparacao } from '@/components/comparador/TabelaComparacao';
import { CardsResumo } from '@/components/comparador/CardsResumo';
import { Spinner } from '@/components/ui/Badge';
import { getComparacaoPorProduto } from '@/lib/queries/precos';
import type { Produto, ComparacaoPreco } from '@/types';

export default function DashboardPage() {
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [comparacao, setComparacao] = useState<ComparacaoPreco | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSelectProduto = useCallback(async (produto: Produto) => {
    setProdutoSelecionado(produto);
    setLoading(true);
    setErro(null);
    setComparacao(null);

    try {
      const data = await getComparacaoPorProduto(produto.id);
      setComparacao(data);
    } catch {
      setErro('Não foi possível carregar os preços. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setProdutoSelecionado(null);
    setComparacao(null);
    setErro(null);
  }, []);

  return (
    <>
      <Header
        title="Comparador de Preços"
        description="Compare preços entre fornecedores em tempo real"
      />
      <PageContent>
        <div className="flex flex-col gap-6 w-full">

          {/* Hero search section */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={18} />
              <span className="text-sm font-semibold opacity-90">CompraVis</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">Compare antes de comprar</h2>
            <p className="text-sm text-blue-200 mb-5">
              Selecione um produto para comparar preços entre todos os fornecedores cadastrados
            </p>
            <SeletorProduto
              onSelect={handleSelectProduto}
              produtoSelecionado={produtoSelecionado}
              onClear={handleClear}
            />
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
              <Spinner size={32} className="mb-4" />
              <p className="text-sm text-slate-500">Carregando preços...</p>
            </div>
          )}

          {/* Error state */}
          {erro && !loading && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <span className="text-sm">{erro}</span>
            </div>
          )}

          {/* Results */}
          {comparacao && !loading && (
            <div className="flex flex-col gap-4 animate-fade-in">
              {/* Product info */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 shrink-0">
                  <Package size={22} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-slate-900">{comparacao.produto.nome}</h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {comparacao.produto.categoria && (
                      <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                        {comparacao.produto.categoria.nome}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                      {comparacao.produto.unidade}
                    </span>
                    {comparacao.produto.especificacoes && (
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        {comparacao.produto.especificacoes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary cards */}
              {comparacao.precos.length > 0 && (
                <CardsResumo comparacao={comparacao} />
              )}

              {/* Comparison table */}
              <TabelaComparacao comparacao={comparacao} />
            </div>
          )}

          {/* Empty initial state */}
          {!produtoSelecionado && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-base font-semibold text-slate-600">Busque um produto acima</p>
              <p className="mt-1 text-sm text-slate-400 max-w-xs">
                Digite o nome do produto ou categoria para comparar preços entre fornecedores
              </p>
            </div>
          )}

        </div>
      </PageContent>
    </>
  );
}
