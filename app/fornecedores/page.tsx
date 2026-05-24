'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Building2, Phone, Mail, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Metadata } from 'next';
import { Header, PageContent } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Badge, StatusDot, Spinner, EmptyState, Card, Toast } from '@/components/ui/Badge';
import {
  getFornecedores,
  criarFornecedor,
  atualizarFornecedor,
  excluirFornecedor,
  contarPrecosDoFornecedor,
} from '@/lib/queries/fornecedores';
import type { Fornecedor } from '@/types';

type Toast = { message: string; type: 'success' | 'error' };

const FORM_EMPTY: Omit<Fornecedor, 'id' | 'criado_em' | 'atualizado_em'> = {
  nome: '',
  contato: '',
  telefone: '',
  email: '',
  observacoes: '',
  ativo: true,
};

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; fornecedor?: Fornecedor }>({ open: false });
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [form, setForm] = useState(FORM_EMPTY);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [contagemPrecos, setContagemPrecos] = useState<Record<string, number>>({});

  const mostrarToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFornecedores();
      setFornecedores(data);
      // Load price counts
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (f) => {
          counts[f.id] = await contarPrecosDoFornecedor(f.id);
        })
      );
      setContagemPrecos(counts);
    } catch {
      mostrarToast('Erro ao carregar fornecedores', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setEditando(null);
    setForm(FORM_EMPTY);
    setModalOpen(true);
  };

  const abrirEditar = (f: Fornecedor) => {
    setEditando(f);
    setForm({
      nome: f.nome,
      contato: f.contato || '',
      telefone: f.telefone || '',
      email: f.email || '',
      observacoes: f.observacoes || '',
      ativo: f.ativo,
    });
    setModalOpen(true);
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) return;
    setFormLoading(true);
    try {
      if (editando) {
        await atualizarFornecedor(editando.id, form);
        mostrarToast('Fornecedor atualizado com sucesso!', 'success');
      } else {
        await criarFornecedor(form);
        mostrarToast('Fornecedor criado com sucesso!', 'success');
      }
      setModalOpen(false);
      carregar();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('unique') || msg.includes('duplicate')) {
        mostrarToast('Já existe um fornecedor com esse nome', 'error');
      } else {
        mostrarToast('Erro ao salvar fornecedor', 'error');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.fornecedor) return;
    setDeleteLoading(true);
    try {
      await excluirFornecedor(deleteModal.fornecedor.id);
      mostrarToast('Fornecedor excluído', 'success');
      setDeleteModal({ open: false });
      carregar();
    } catch {
      mostrarToast('Erro ao excluir fornecedor', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleAtivo = async (f: Fornecedor) => {
    try {
      await atualizarFornecedor(f.id, { ativo: !f.ativo });
      mostrarToast(f.ativo ? 'Fornecedor desativado' : 'Fornecedor ativado', 'success');
      carregar();
    } catch {
      mostrarToast('Erro ao atualizar status', 'error');
    }
  };

  const filtrados = fornecedores.filter((f) => {
    const q = busca.toLowerCase();
    return (
      f.nome.toLowerCase().includes(q) ||
      (f.contato || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Header
        title="Fornecedores"
        description="Gerencie seus fornecedores de materiais"
        actions={
          <Button onClick={abrirNovo} icon={<Plus size={14} />} size="sm" id="btn-novo-fornecedor">
            Novo Fornecedor
          </Button>
        }
      />
      <PageContent>
        <div className="flex flex-col gap-4 w-full">

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                id="busca-fornecedor"
                placeholder="Buscar por nome, contato ou e-mail..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                leftIcon={<Search size={15} />}
              />
            </div>
            <Badge variant="neutral">
              {filtrados.length} {filtrados.length !== 1 ? 'fornecedores' : 'fornecedor'}
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
                icon={<Building2 size={28} />}
                title="Nenhum fornecedor encontrado"
                description={busca ? 'Tente outro termo de busca' : 'Comece adicionando seu primeiro fornecedor'}
                action={
                  !busca && (
                    <Button onClick={abrirNovo} icon={<Plus size={14} />} size="sm">
                      Adicionar Fornecedor
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
                        Fornecedor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                        Contato
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                        Preços
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((f, idx) => (
                      <tr
                        key={f.id}
                        className={`hover:bg-slate-50 transition-colors ${idx < filtrados.length - 1 ? 'border-b border-slate-100' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                              <Building2 size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{f.nome}</p>
                              {f.contato && (
                                <p className="text-xs text-slate-400 md:hidden">{f.contato}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex flex-col gap-0.5">
                            {f.telefone && (
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone size={11} className="text-slate-400" />
                                {f.telefone}
                              </span>
                            )}
                            {f.email && (
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Mail size={11} className="text-slate-400" />
                                {f.email}
                              </span>
                            )}
                            {!f.telefone && !f.email && (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className="inline-flex items-center justify-center h-6 min-w-6 rounded-full bg-slate-100 text-xs font-semibold text-slate-600 px-2">
                            {contagemPrecos[f.id] ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleAtivo(f)}
                            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                            aria-label={f.ativo ? 'Desativar fornecedor' : 'Ativar fornecedor'}
                          >
                            {f.ativo ? (
                              <ToggleRight size={20} className="text-green-500" />
                            ) : (
                              <ToggleLeft size={20} className="text-slate-300" />
                            )}
                            <StatusDot active={f.ativo} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Pencil size={14} />}
                              onClick={() => abrirEditar(f)}
                              aria-label="Editar"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 size={14} />}
                              onClick={() => setDeleteModal({ open: true, fornecedor: f })}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50"
                              aria-label="Excluir"
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

      {/* Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
              id="btn-salvar-fornecedor"
            >
              {editando ? 'Salvar Alterações' : 'Criar Fornecedor'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Input
            id="fornecedor-nome"
            label="Nome"
            placeholder="Ex: Projeto Vale Comunicação"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            required
            autoFocus
          />
          <Input
            id="fornecedor-contato"
            label="Contato"
            placeholder="Nome do responsável"
            value={form.contato}
            onChange={(e) => setForm((f) => ({ ...f, contato: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="fornecedor-telefone"
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
            />
            <Input
              id="fornecedor-email"
              label="E-mail"
              type="email"
              placeholder="contato@exemplo.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <Textarea
            id="fornecedor-obs"
            label="Observações"
            placeholder="Informações adicionais sobre o fornecedor..."
            value={form.observacoes}
            onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none" htmlFor="fornecedor-ativo">
              <div className="relative">
                <input
                  type="checkbox"
                  id="fornecedor-ativo"
                  className="sr-only"
                  checked={form.ativo}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${form.ativo ? 'bg-green-500' : 'bg-slate-200'}`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.ativo ? 'translate-x-5' : ''}`}
                />
              </div>
              <span className="text-sm text-slate-700">Fornecedor ativo</span>
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete}
        title="Excluir Fornecedor"
        message={`Tem certeza que deseja excluir "${deleteModal.fornecedor?.nome}"? Todos os preços associados serão excluídos também.`}
        loading={deleteLoading}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
