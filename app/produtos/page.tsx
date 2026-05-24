'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Package, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { Header, PageContent } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Badge, Spinner, EmptyState, Card, Toast } from '@/components/ui/Badge';
import {
  getProdutos,
  getCategorias,
  criarProduto,
  atualizarProduto,
  excluirProduto,
  criarCategoria,
  excluirCategoria,
  contarFornecedoresDoProduto,
} from '@/lib/queries/produtos';
import type { Produto, Categoria } from '@/types';

type ToastMsg = { message: string; type: 'success' | 'error' };

const UNIDADES = [
  'm²', 'chapa', 'metro', 'unidade', 'rolo', 'kit', 'barra', 'caixa', 'folha', 'par', 'conjunto'
];

const FORM_EMPTY = {
  nome: '',
  categoria_id: '' as string | undefined,
  unidade: 'm²',
  descricao: '',
  especificacoes: '',
  ativo: true,
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; produto?: Produto }>({ open: false });
  const [editando, setEditando] = useState<Produto | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<ToastMsg | null>(null);
  const [contagemForn, setContagemForn] = useState<Record<string, number>>({});
  const [catExpanded, setCatExpanded] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [addCatLoading, setAddCatLoading] = useState(false);
  const [deleteCatModal, setDeleteCatModal] = useState<{ open: boolean; cat?: Categoria }>({ open: false });

  const mostrarToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProdutos(), getCategorias()]);
      setProdutos(prods);
      setCategorias(cats);
      const counts: Record<string, number> = {};
      await Promise.all(prods.map(async (p) => {
        counts[p.id] = await contarFornecedoresDoProduto(p.id);
      }));
      setContagemForn(counts);
    } catch {
      mostrarToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_EMPTY);
    setModalOpen(true);
  };

  const abrirEditar = (p: Produto) => {
    setEditando(p);
    setForm({
      nome: p.nome,
      categoria_id: p.categoria_id || '',
      unidade: p.unidade,
      descricao: p.descricao || '',
      especificacoes: p.especificacoes || '',
      ativo: p.ativo,
    });
    setModalOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) return;
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        categoria_id: form.categoria_id || undefined,
      };
      if (editando) {
        await atualizarProduto(editando.id, payload);
        mostrarToast('Produto atualizado!', 'success');
      } else {
        await criarProduto(payload);
        mostrarToast('Produto criado!', 'success');
      }
      setModalOpen(false);
      carregar();
    } catch {
      mostrarToast('Erro ao salvar produto', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.produto) return;
    setDeleteLoading(true);
    try {
      await excluirProduto(deleteModal.produto.id);
      mostrarToast('Produto excluído', 'success');
      setDeleteModal({ open: false });
      carregar();
    } catch {
      mostrarToast('Erro ao excluir produto', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddCategoria = async () => {
    if (!novaCategoria.trim()) return;
    setAddCatLoading(true);
    try {
      await criarCategoria({ nome: novaCategoria.trim() });
      setNovaCategoria('');
      mostrarToast('Categoria criada!', 'success');
      carregar();
    } catch {
      mostrarToast('Erro ao criar categoria (nome duplicado?)', 'error');
    } finally {
      setAddCatLoading(false);
    }
  };

  const handleDeleteCategoria = async () => {
    if (!deleteCatModal.cat) return;
    try {
      await excluirCategoria(deleteCatModal.cat.id);
      mostrarToast('Categoria excluída', 'success');
      setDeleteCatModal({ open: false });
      carregar();
    } catch {
      mostrarToast('Erro ao excluir categoria', 'error');
    }
  };

  const filtrados = produtos.filter((p) => {
    const q = busca.toLowerCase();
    const matchBusca = p.nome.toLowerCase().includes(q) ||
      (p.especificacoes || '').toLowerCase().includes(q) ||
      (p.descricao || '').toLowerCase().includes(q);
    const matchCat = !filtroCat || p.categoria_id === filtroCat;
    return matchBusca && matchCat;
  });

  return (
    <>
      <Header
        title="Produtos"
        description="Gerencie produtos e categorias de materiais"
        actions={
          <Button onClick={abrirNovo} icon={<Plus size={14} />} size="sm" id="btn-novo-produto">
            Novo Produto
          </Button>
        }
      />
      <PageContent>
        <div className="flex flex-col gap-4 w-full">

          {/* Categories accordion */}
          <Card>
            <button
              onClick={() => setCatExpanded(!catExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors rounded-xl"
              id="toggle-categorias"
            >
              <span className="flex items-center gap-2">
                <Tag size={15} className="text-blue-500" />
                Gerenciar Categorias
                <Badge variant="neutral">{categorias.length}</Badge>
              </span>
              {catExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {catExpanded && (
              <div className="px-4 pb-4 border-t border-slate-100 pt-3 animate-fade-in">
                <div className="flex gap-2 mb-3">
                  <Input
                    id="nova-categoria-nome"
                    placeholder="Nome da nova categoria..."
                    value={novaCategoria}
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategoria()}
                  />
                  <Button
                    icon={<Plus size={14} />}
                    size="sm"
                    onClick={handleAddCategoria}
                    loading={addCatLoading}
                    disabled={!novaCategoria.trim()}
                    id="btn-adicionar-categoria"
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-slate-700">{cat.nome}</span>
                      <button
                        onClick={() => setDeleteCatModal({ open: true, cat })}
                        className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label={`Excluir categoria ${cat.nome}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {categorias.length === 0 && (
                    <p className="text-xs text-slate-400">Nenhuma categoria criada</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-48">
              <Input
                id="busca-produto-filtro"
                placeholder="Buscar produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                leftIcon={<Search size={15} />}
              />
            </div>
            <Select
              id="filtro-categoria"
              options={categorias.map((c) => ({ value: c.id, label: c.nome }))}
              placeholder="Todas as categorias"
              value={filtroCat}
              onChange={(e) => setFiltroCat(e.target.value)}
              className="w-48"
            />
            <Badge variant="neutral">
              {filtrados.length} produto{filtrados.length !== 1 ? 's' : ''}
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
                icon={<Package size={28} />}
                title="Nenhum produto encontrado"
                description={busca || filtroCat ? 'Tente outros filtros' : 'Comece adicionando seu primeiro produto'}
                action={
                  !busca && !filtroCat && (
                    <Button onClick={abrirNovo} icon={<Plus size={14} />} size="sm">
                      Adicionar Produto
                    </Button>
                  )
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Produto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                        Categoria
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                        Unidade
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                        Fornecedores
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50 transition-colors ${idx < filtrados.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <Package size={14} className="text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{p.nome}</p>
                              {p.especificacoes && (
                                <p className="text-xs text-slate-400 truncate max-w-xs">{p.especificacoes}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {p.categoria ? (
                            <Badge variant="info" size="sm">{p.categoria.nome}</Badge>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">
                            {p.unidade}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 px-2">
                            {contagemForn[p.id] ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Pencil size={14} />}
                              onClick={() => abrirEditar(p)}
                              aria-label="Editar produto"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 size={14} />}
                              onClick={() => setDeleteModal({ open: true, produto: p })}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                              aria-label="Excluir produto"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </PageContent>

      {/* Product Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Produto' : 'Novo Produto'}
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
              disabled={!form.nome.trim()}
              id="btn-salvar-produto"
            >
              {editando ? 'Salvar Alterações' : 'Criar Produto'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            id="produto-nome"
            label="Nome do Produto"
            placeholder="Ex: PVC Forex 10mm"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            required
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="produto-categoria"
              label="Categoria"
              options={categorias.map((c) => ({ value: c.id, label: c.nome }))}
              placeholder="Sem categoria"
              value={form.categoria_id || ''}
              onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value }))}
            />
            <Select
              id="produto-unidade"
              label="Unidade"
              options={UNIDADES.map((u) => ({ value: u, label: u }))}
              value={form.unidade}
              onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
              required
            />
          </div>
          <Input
            id="produto-descricao"
            label="Descrição"
            placeholder="Breve descrição do produto"
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          />
          <Textarea
            id="produto-especificacoes"
            label="Especificações Técnicas"
            placeholder="Gramatura, espessura, cores, etc."
            value={form.especificacoes}
            onChange={(e) => setForm((f) => ({ ...f, especificacoes: e.target.value }))}
          />
        </div>
      </Modal>

      {/* Delete Product Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir "${deleteModal.produto?.nome}"? Todos os preços associados serão excluídos também.`}
        loading={deleteLoading}
      />

      {/* Delete Category Modal */}
      <ConfirmModal
        open={deleteCatModal.open}
        onClose={() => setDeleteCatModal({ open: false })}
        onConfirm={handleDeleteCategoria}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir a categoria "${deleteCatModal.cat?.nome}"? Os produtos desta categoria ficarão sem categoria.`}
        confirmLabel="Excluir"
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
