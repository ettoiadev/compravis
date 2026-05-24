'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Plus, Pencil, Trash2, Check, X, AlertTriangle,
  DollarSign, Package, Building2, Calendar
} from 'lucide-react';
import { Header, PageContent } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Badge, Spinner, EmptyState, Card, Toast } from '@/components/ui/Badge';
import { getProdutos } from '@/lib/queries/produtos';
import { getFornecedores } from '@/lib/queries/fornecedores';
import {
  getTodosOsPrecos,
  getPrecosPorProduto,
  criarPreco,
  atualizarPreco,
  excluirPreco,
} from '@/lib/queries/precos';
import { formatarMoeda, formatarData, parsearMoeda, precoDesatualizado, diasDesdeAtualizacao } from '@/lib/utils/formatters';
import type { Produto, Fornecedor, Preco } from '@/types';

type ToastMsg = { message: string; type: 'success' | 'error' };

interface FormPreco {
  produto_id: string;
  fornecedor_id: string;
  preco: string;
  preco_minimo: string;
  quantidade_minima: string;
  prazo_entrega_dias: string;
  observacoes: string;
}

const FORM_EMPTY: FormPreco = {
  produto_id: '',
  fornecedor_id: '',
  preco: '',
  preco_minimo: '',
  quantidade_minima: '',
  prazo_entrega_dias: '',
  observacoes: '',
};

export default function PrecosClient({
  initialPrecos,
  initialProdutos,
  initialFornecedores
}: {
  initialPrecos: Preco[];
  initialProdutos: Produto[];
  initialFornecedores: Fornecedor[];
}) {
  const [precos, setPrecos] = useState<Preco[]>(initialPrecos);
  const [produtos, setProdutos] = useState<Produto[]>(initialProdutos);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(initialFornecedores);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroProduto, setFiltroProduto] = useState('');
  const [filtroFornecedor, setFiltroFornecedor] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; preco?: Preco }>({ open: false });
  const [editando, setEditando] = useState<Preco | null>(null);
  const [form, setForm] = useState<FormPreco>(FORM_EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  // Inline editing
  const [inlineEdit, setInlineEdit] = useState<{ id: string; value: string } | null>(null);
  const inlineRef = useRef<HTMLInputElement>(null);

  const mostrarToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [precoData, prodData, fornData] = await Promise.all([
        getTodosOsPrecos(),
        getProdutos(),
        getFornecedores(),
      ]);
      setPrecos(precoData);
      setProdutos(prodData);
      setFornecedores(fornData);
    } catch {
      mostrarToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect removido pois os dados vêm do servidor (RSC)

  useEffect(() => {
    if (inlineEdit && inlineRef.current) {
      inlineRef.current.focus();
      inlineRef.current.select();
    }
  }, [inlineEdit]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_EMPTY);
    setModalOpen(true);
  };

  const abrirEditar = (p: Preco) => {
    setEditando(p);
    setForm({
      produto_id: p.produto_id,
      fornecedor_id: p.fornecedor_id,
      preco: p.preco.toString().replace('.', ','),
      preco_minimo: p.preco_minimo?.toString().replace('.', ',') || '',
      quantidade_minima: p.quantidade_minima?.toString() || '',
      prazo_entrega_dias: p.prazo_entrega_dias?.toString() || '',
      observacoes: p.observacoes || '',
    });
    setModalOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.produto_id || !form.fornecedor_id || !form.preco) return;
    setFormLoading(true);
    try {
      const payload = {
        produto_id: form.produto_id,
        fornecedor_id: form.fornecedor_id,
        preco: parsearMoeda(form.preco),
        preco_minimo: form.preco_minimo ? parsearMoeda(form.preco_minimo) : undefined,
        quantidade_minima: form.quantidade_minima ? parseFloat(form.quantidade_minima) : undefined,
        prazo_entrega_dias: form.prazo_entrega_dias ? parseInt(form.prazo_entrega_dias) : undefined,
        observacoes: form.observacoes || undefined,
        data_atualizacao: new Date().toISOString().split('T')[0],
      };
      if (editando) {
        await atualizarPreco(editando.id, payload);
        mostrarToast('Preço atualizado!', 'success');
      } else {
        await criarPreco(payload);
        mostrarToast('Preço cadastrado!', 'success');
      }
      setModalOpen(false);
      carregar();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('unique') || msg.includes('duplicate')) {
        mostrarToast('Já existe preço cadastrado para este produto/fornecedor', 'error');
      } else {
        mostrarToast('Erro ao salvar preço', 'error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.preco) return;
    setDeleteLoading(true);
    try {
      await excluirPreco(deleteModal.preco.id);
      mostrarToast('Preço excluído', 'success');
      setDeleteModal({ open: false });
      carregar();
    } catch {
      mostrarToast('Erro ao excluir preço', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInlineSave = async (id: string) => {
    if (!inlineEdit) return;
    const valor = parsearMoeda(inlineEdit.value);
    if (isNaN(valor) || valor < 0) {
      mostrarToast('Valor inválido', 'error');
      setInlineEdit(null);
      return;
    }
    try {
      await atualizarPreco(id, {
        preco: valor,
        data_atualizacao: new Date().toISOString().split('T')[0],
      });
      mostrarToast('Preço atualizado!', 'success');
      setInlineEdit(null);
      carregar();
    } catch {
      mostrarToast('Erro ao atualizar preço', 'error');
      setInlineEdit(null);
    }
  };

  const filtrados = precos.filter((p) => {
    const nomeProduto = (p.produto as unknown as Produto)?.nome || '';
    const nomeForn = (p.fornecedor as unknown as Fornecedor)?.nome || '';
    const q = busca.toLowerCase();
    const matchBusca = nomeProduto.toLowerCase().includes(q) || nomeForn.toLowerCase().includes(q);
    const matchProd = !filtroProduto || p.produto_id === filtroProduto;
    const matchForn = !filtroFornecedor || p.fornecedor_id === filtroFornecedor;
    return matchBusca && matchProd && matchForn;
  });

  const desatualizados = filtrados.filter((p) => precoDesatualizado(p.data_atualizacao)).length;

  return (
    <>
      <Header
        title="Preços"
        description="Gerencie preços por produto e fornecedor"
        actions={
          <Button onClick={abrirNovo} icon={<Plus size={14} />} size="sm" id="btn-novo-preco">
            Novo Preço
          </Button>
        }
      />
      <PageContent>
        <div className="flex flex-col gap-4 w-full">

          {/* Alert for stale prices */}
          {desatualizados > 0 && (
            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                <span className="font-semibold">{desatualizados}</span> preço{desatualizados !== 1 ? 's' : ''} não {desatualizados !== 1 ? 'foram atualizados' : 'foi atualizado'} há mais de 30 dias
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-48">
              <Input
                id="busca-preco"
                placeholder="Buscar por produto ou fornecedor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                leftIcon={<Search size={15} />}
              />
            </div>
            <Select
              id="filtro-produto-preco"
              options={produtos.map((p) => ({ value: p.id, label: p.nome }))}
              placeholder="Todos os produtos"
              value={filtroProduto}
              onChange={(e) => setFiltroProduto(e.target.value)}
              className="w-48"
            />
            <Select
              id="filtro-fornecedor-preco"
              options={fornecedores.map((f) => ({ value: f.id, label: f.nome }))}
              placeholder="Todos os fornecedores"
              value={filtroFornecedor}
              onChange={(e) => setFiltroFornecedor(e.target.value)}
              className="w-48"
            />
            <Badge variant="neutral">
              {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Table */}
          <Card>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size={28} />
              </div>
            ) : filtrados.length === 0 ? (
              <EmptyState
                icon={<DollarSign size={28} />}
                title="Nenhum preço encontrado"
                description="Adicione preços para os produtos cadastrados"
                action={
                  <Button onClick={abrirNovo} icon={<Plus size={14} />} size="sm">
                    Adicionar Preço
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Fornecedor</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Prazo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Atualizado</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((p, idx) => {
                      const produto = p.produto as unknown as Produto;
                      const fornecedor = p.fornecedor as unknown as Fornecedor;
                      const desatualizado = precoDesatualizado(p.data_atualizacao);
                      const dias = diasDesdeAtualizacao(p.data_atualizacao);
                      const isEditingInline = inlineEdit?.id === p.id;

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50 transition-colors ${idx < filtrados.length - 1 ? 'border-b border-slate-100' : ''} ${desatualizado ? 'bg-amber-50/30' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-slate-400 shrink-0" />
                              <span className="text-sm font-medium text-slate-900 truncate max-w-[140px] sm:max-w-xs">
                                {produto?.nome || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <Building2 size={13} className="text-slate-400 shrink-0" />
                              <span className="text-sm text-slate-600 truncate max-w-[120px]">
                                {fornecedor?.nome || '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {isEditingInline ? (
                              <div className="flex items-center justify-end gap-1">
                                <input
                                  ref={inlineRef}
                                  className="w-24 text-right text-sm font-semibold border border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={inlineEdit.value}
                                  onChange={(e) => setInlineEdit({ id: p.id, value: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleInlineSave(p.id);
                                    if (e.key === 'Escape') setInlineEdit(null);
                                  }}
                                />
                                <button
                                  onClick={() => handleInlineSave(p.id)}
                                  className="flex items-center justify-center h-7 w-7 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                  aria-label="Confirmar edição"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => setInlineEdit(null)}
                                  className="flex items-center justify-center h-7 w-7 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                                  aria-label="Cancelar edição"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors group flex items-center justify-end gap-1"
                                onClick={() => setInlineEdit({ id: p.id, value: p.preco.toString().replace('.', ',') })}
                                title="Clique para editar"
                                aria-label="Editar preço inline"
                              >
                                {formatarMoeda(p.preco)}
                                <Pencil size={11} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {p.prazo_entrega_dias ? (
                              <span className="text-xs text-slate-500">{p.prazo_entrega_dias}d</span>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 text-xs text-slate-500">
                                <Calendar size={11} />
                                {formatarData(p.data_atualizacao)}
                              </span>
                              {desatualizado && (
                                <span className="flex items-center gap-1 text-[10px] text-amber-600">
                                  <AlertTriangle size={9} />
                                  {dias}d atrás
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Pencil size={14} />}
                                onClick={() => abrirEditar(p)}
                                aria-label="Editar preço"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<Trash2 size={14} />}
                                onClick={() => setDeleteModal({ open: true, preco: p })}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                aria-label="Excluir preço"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </PageContent>

      {/* Price Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Preço' : 'Cadastrar Preço'}
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSalvar}
              loading={formLoading}
              disabled={!form.produto_id || !form.fornecedor_id || !form.preco}
              id="btn-salvar-preco"
            >
              {editando ? 'Salvar Alterações' : 'Cadastrar Preço'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            id="preco-produto"
            label="Produto"
            options={produtos.map((p) => ({ value: p.id, label: p.nome }))}
            placeholder="Selecione um produto..."
            value={form.produto_id}
            onChange={(e) => setForm((f) => ({ ...f, produto_id: e.target.value }))}
            required
          />
          <Select
            id="preco-fornecedor"
            label="Fornecedor"
            options={fornecedores.filter((f) => f.ativo).map((f) => ({ value: f.id, label: f.nome }))}
            placeholder="Selecione um fornecedor..."
            value={form.fornecedor_id}
            onChange={(e) => setForm((f) => ({ ...f, fornecedor_id: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="preco-valor"
              label="Preço"
              placeholder="0,00"
              value={form.preco}
              onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
              hint="Ex: 250,00 ou R$ 250,00"
              required
              leftIcon={<span className="text-slate-400 text-xs font-semibold">R$</span>}
            />
            <Input
              id="preco-minimo"
              label="Preço Mínimo"
              placeholder="0,00"
              value={form.preco_minimo}
              onChange={(e) => setForm((f) => ({ ...f, preco_minimo: e.target.value }))}
              hint="Preço para pedido mínimo"
              leftIcon={<span className="text-slate-400 text-xs font-semibold">R$</span>}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="preco-qtd-minima"
              label="Quantidade Mínima"
              type="number"
              min="0"
              step="0.01"
              placeholder="1"
              value={form.quantidade_minima}
              onChange={(e) => setForm((f) => ({ ...f, quantidade_minima: e.target.value }))}
            />
            <Input
              id="preco-prazo"
              label="Prazo de Entrega (dias)"
              type="number"
              min="0"
              placeholder="Ex: 3"
              value={form.prazo_entrega_dias}
              onChange={(e) => setForm((f) => ({ ...f, prazo_entrega_dias: e.target.value }))}
            />
          </div>
          <Textarea
            id="preco-obs"
            label="Observações"
            placeholder="Condições especiais, descontos, etc."
            value={form.observacoes}
            onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
          />
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete}
        title="Excluir Preço"
        message="Tem certeza que deseja excluir este preço?"
        loading={deleteLoading}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
