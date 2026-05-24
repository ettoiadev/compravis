'use client';

import { useState } from 'react';
import { ArrowUpDown, Phone, Mail, Clock, AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { ComparacaoPreco, OrdenacaoPreco } from '@/types';
import { formatarMoeda, formatarData, precoDesatualizado } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/helpers';

interface TabelaComparacaoProps {
  comparacao: ComparacaoPreco;
}

export function TabelaComparacao({ comparacao }: TabelaComparacaoProps) {
  const [ordenacao, setOrdenacao] = useState<OrdenacaoPreco>('preco_asc');

  const precosOrdenados = [...comparacao.precos].sort((a, b) => {
    switch (ordenacao) {
      case 'preco_asc':
        return a.preco - b.preco;
      case 'preco_desc':
        return b.preco - a.preco;
      case 'fornecedor_az':
        return a.fornecedor.nome.localeCompare(b.fornecedor.nome, 'pt-BR');
      case 'data_atualizacao':
        return new Date(b.data_atualizacao).getTime() - new Date(a.data_atualizacao).getTime();
      default:
        return 0;
    }
  });

  if (comparacao.precos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-slate-200">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <TrendingDown size={24} />
        </div>
        <p className="text-sm font-semibold text-slate-600">Nenhum preço cadastrado</p>
        <p className="mt-1 text-xs text-slate-400">
          Vá até a página de Preços e adicione preços para este produto
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Ordenação */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{comparacao.precos.length}</span> fornecedor{comparacao.precos.length !== 1 ? 'es' : ''} com preço
        </p>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-slate-400" />
          <select
            id="ordenacao-preco"
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as OrdenacaoPreco)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            aria-label="Ordenar por"
          >
            <option value="preco_asc">Menor preço</option>
            <option value="preco_desc">Maior preço</option>
            <option value="fornecedor_az">Fornecedor A-Z</option>
            <option value="data_atualizacao">Mais recente</option>
          </select>
        </div>
      </div>

      {/* Cards de fornecedores */}
      <div className="flex flex-col gap-3">
        {precosOrdenados.map((preco, idx) => {
          const desatualizado = precoDesatualizado(preco.data_atualizacao);

          return (
            <div
              key={preco.id}
              className={cn(
                'relative rounded-xl border bg-white p-4 transition-all duration-150',
                preco.isMaisBarato
                  ? 'border-green-200 bg-green-50/30 shadow-sm ring-1 ring-green-200'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              )}
            >
              {/* Position indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {preco.isMaisBarato && (
                  <span className="badge-mais-barato">
                    <TrendingDown size={10} />
                    MAIS BARATO
                  </span>
                )}
                {preco.isMaisCaro && comparacao.precos.length > 1 && (
                  <span className="badge-mais-caro">
                    MAIS CARO
                  </span>
                )}
                {desatualizado && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                    <AlertTriangle size={9} />
                    DESATUALIZADO
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4 pr-32">
                {/* Ranking */}
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
                  preco.isMaisBarato
                    ? 'bg-green-600 text-white'
                    : idx === 1
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {idx + 1}
                </div>

                {/* Supplier info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{preco.fornecedor.nome}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {preco.fornecedor.telefone && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone size={11} />
                        {preco.fornecedor.telefone}
                      </span>
                    )}
                    {preco.fornecedor.email && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail size={11} />
                        {preco.fornecedor.email}
                      </span>
                    )}
                    {preco.prazo_entrega_dias && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={11} />
                        {preco.prazo_entrega_dias}d entrega
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className={cn(
                    'text-xl font-bold',
                    preco.isMaisBarato ? 'text-green-600' : preco.isMaisCaro ? 'text-red-500' : 'text-slate-800'
                  )}>
                    {formatarMoeda(preco.preco)}
                  </p>
                  <p className="text-xs text-slate-400">
                    por {comparacao.produto.unidade}
                  </p>
                  {preco.percentualDiferenca > 0 && (
                    <div className="flex items-center justify-end gap-0.5 mt-0.5">
                      <TrendingUp size={10} className="text-red-400" />
                      <span className="text-xs font-medium text-red-400">
                        +{preco.percentualDiferenca}%
                      </span>
                    </div>
                  )}
                  {preco.percentualDiferenca === 0 && comparacao.precos.length > 1 && (
                    <div className="flex items-center justify-end gap-0.5 mt-0.5">
                      <Minus size={10} className="text-green-500" />
                      <span className="text-xs font-medium text-green-500">melhor</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer row */}
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  {preco.quantidade_minima && preco.quantidade_minima > 1 && (
                    <span className="text-xs text-slate-400">
                      Mín: {preco.quantidade_minima} {comparacao.produto.unidade}
                    </span>
                  )}
                  {preco.observacoes && (
                    <span className="text-xs text-slate-400 italic truncate max-w-xs">
                      {preco.observacoes}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  Atualizado em {formatarData(preco.data_atualizacao)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
