'use client';

import { TrendingDown, TrendingUp, BarChart2, Zap } from 'lucide-react';
import { formatarMoeda } from '@/lib/utils/formatters';
import type { ComparacaoPreco } from '@/types';

interface CardsResumoProps {
  comparacao: ComparacaoPreco;
}

export function CardsResumo({ comparacao }: CardsResumoProps) {
  const { menorPreco, maiorPreco, mediaPreco, economia, precos } = comparacao;

  if (precos.length === 0) return null;

  const cards = [
    {
      label: 'Menor Preço',
      value: formatarMoeda(menorPreco),
      sub: precos.find((p) => p.isMaisBarato)?.fornecedor.nome || '—',
      icon: TrendingDown,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
      border: 'border-green-200',
    },
    {
      label: 'Maior Preço',
      value: formatarMoeda(maiorPreco),
      sub: precos.find((p) => p.isMaisCaro)?.fornecedor.nome || precos[precos.length - 1]?.fornecedor.nome || '—',
      icon: TrendingUp,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      valueColor: 'text-red-500',
      border: 'border-slate-200',
    },
    {
      label: 'Média de Preço',
      value: formatarMoeda(mediaPreco),
      sub: `${precos.length} fornecedor${precos.length !== 1 ? 'es' : ''}`,
      icon: BarChart2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-slate-800',
      border: 'border-slate-200',
    },
    {
      label: 'Economia Potencial',
      value: formatarMoeda(economia),
      sub: 'entre menor e maior preço',
      icon: Zap,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
      border: 'border-slate-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-xl border ${card.border} bg-white p-4 flex flex-col gap-3 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon size={16} className={card.iconColor} />
              </div>
            </div>
            <div>
              <p className={`text-xl font-bold ${card.valueColor}`}>{card.value}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{card.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
