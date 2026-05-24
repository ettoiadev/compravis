'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Package } from 'lucide-react';
import { buscarProdutos } from '@/lib/queries/produtos';
import type { Produto } from '@/types';
import { cn } from '@/lib/utils/helpers';

interface SeletorProdutoProps {
  onSelect: (produto: Produto) => void;
  produtoSelecionado?: Produto | null;
  onClear?: () => void;
}

export function SeletorProduto({ onSelect, produtoSelecionado, onClear }: SeletorProdutoProps) {
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (busca.trim().length < 1) {
      if (busca.length === 0) {
        // Show all products when empty
        setLoading(true);
        buscarProdutos('').then((data) => {
          setResultados(data);
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setResultados([]);
        setAberto(false);
      }
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await buscarProdutos(busca);
        setResultados(data);
        setAberto(true);
      } catch {
        setResultados([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [busca]);

  const handleSelect = (produto: Produto) => {
    onSelect(produto);
    setBusca('');
    setAberto(false);
    setResultados([]);
  };

  const handleClear = () => {
    setBusca('');
    setAberto(false);
    setResultados([]);
    onClear?.();
  };

  if (produtoSelecionado) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 shrink-0">
          <Package size={18} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-900 truncate">{produtoSelecionado.nome}</p>
          <p className="text-xs text-blue-500 truncate">
            {produtoSelecionado.categoria?.nome} · {produtoSelecionado.unidade}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center justify-center h-8 w-8 rounded-lg text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors shrink-0"
          aria-label="Limpar seleção"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          id="busca-produto"
          type="text"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setAberto(true);
          }}
          onFocus={() => {
            setAberto(true);
            if (!busca) {
              setLoading(true);
              buscarProdutos('').then((data) => {
                setResultados(data);
                setLoading(false);
              }).catch(() => setLoading(false));
            }
          }}
          placeholder="Buscar produto por nome, especificação ou categoria..."
          className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
          aria-label="Buscar produto"
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </span>
        )}
      </div>

      {aberto && resultados.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-20 overflow-hidden animate-fade-in max-h-80 overflow-y-auto">
          {resultados.map((produto, idx) => (
            <button
              key={produto.id}
              onClick={() => handleSelect(produto)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors',
                idx < resultados.length - 1 ? 'border-b border-slate-100' : ''
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                <Package size={14} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{produto.nome}</p>
                <p className="text-xs text-slate-400 truncate">
                  {produto.categoria?.nome || 'Sem categoria'} · {produto.unidade}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {aberto && !loading && busca.length > 0 && resultados.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-20 p-6 text-center animate-fade-in">
          <Package size={24} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-500">Nenhum produto encontrado para &quot;{busca}&quot;</p>
        </div>
      )}
    </div>
  );
}
