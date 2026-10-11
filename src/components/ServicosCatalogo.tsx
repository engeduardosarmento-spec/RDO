import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Save,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { CatalogoServico, Contrato, GrupoServico, UnidadeMedicao } from '../types';
import { SERVICOS_PADRAO_DNIT, db } from '../db/database';
import { ConfirmModal } from './ConfirmModal';

interface ServicosCatalogoProps {
  contratos: Contrato[];
  contratoSelecionadoId?: string;
  onSelecionarContrato: (id: string) => void;
  servicos: CatalogoServico[];
  onSalvarServico: (servico: CatalogoServico) => Promise<void>;
  onExcluirServico: (servicoId: string) => Promise<void>;
  onRecarregarServicos: () => Promise<void>;
}

const gruposOficiais: GrupoServico[] = [
  'Implantação',
  'Pavimentação — pista e acostamento',
  'Drenagem e obras de arte',
  'Obras complementares',
  'Outros serviços',
];

const unidadesMedicao: UnidadeMedicao[] = ['m', 'm²', 'm³', 'km', 'un', 't', 'kg', 'h'];

export const ServicosCatalogo: React.FC<ServicosCatalogoProps> = ({
  contratos,
  contratoSelecionadoId,
  onSelecionarContrato,
  servicos,
  onSalvarServico,
  onExcluirServico,
  onRecarregarServicos,
}) => {
  const [busca, setBusca] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState<string>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState<CatalogoServico | null>(null);
  const [servicoParaExcluir, setServicoParaExcluir] = useState<string | null>(null);
  const [carregandoPadrao, setCarregandoPadrao] = useState(false);

  // Form State
  const [nome, setNome] = useState('');
  const [grupo, setGrupo] = useState<GrupoServico>('Pavimentação — pista e acostamento');
  const [codigoReferencia, setCodigoReferencia] = useState('');
  const [unidade, setUnidade] = useState<UnidadeMedicao>('m²');
  const [descricaoPadrao, setDescricaoPadrao] = useState('');
  const [observacoesTecnicas, setObservacoesTecnicas] = useState('');
  const [larguraPadrao, setLarguraPadrao] = useState<number | ''>('');
  const [espessuraPadrao, setEspessuraPadrao] = useState<number | ''>('');
  const [erro, setErro] = useState<string | null>(null);

  const contratoAtivo = contratos.find((c) => c.id === contratoSelecionadoId) || contratos[0];

  const servicosContrato = servicos.filter(
    (s) => s.contratoId === (contratoAtivo ? contratoAtivo.id : '')
  );

  const servicosFiltrados = servicosContrato.filter((s) => {
    const bateTexto =
      s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (s.codigoReferencia && s.codigoReferencia.toLowerCase().includes(busca.toLowerCase())) ||
      (s.descricaoPadrao && s.descricaoPadrao.toLowerCase().includes(busca.toLowerCase()));
    const bateGrupo = grupoFiltro === 'todos' || s.grupo === grupoFiltro;
    return bateTexto && bateGrupo;
  });

  const abrirModalNovo = () => {
    setServicoEmEdicao(null);
    setNome('');
    setGrupo('Pavimentação — pista e acostamento');
    setCodigoReferencia('');
    setUnidade('m²');
    setDescricaoPadrao('');
    setObservacoesTecnicas('');
    setLarguraPadrao('');
    setEspessuraPadrao('');
    setErro(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (s: CatalogoServico) => {
    setServicoEmEdicao(s);
    setNome(s.nome);
    setGrupo(s.grupo);
    setCodigoReferencia(s.codigoReferencia || '');
    setUnidade(s.unidade);
    setDescricaoPadrao(s.descricaoPadrao || '');
    setObservacoesTecnicas(s.observacoesTecnicas || '');
    setLarguraPadrao(s.larguraPadrao !== undefined ? s.larguraPadrao : '');
    setEspessuraPadrao(s.espessuraPadrao !== undefined ? s.espessuraPadrao : '');
    setErro(null);
    setModalAberto(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contratoAtivo) {
      setErro('Selecione ou cadastre um contrato primeiro.');
      return;
    }
    if (!nome.trim()) {
      setErro('Informe o nome do serviço.');
      return;
    }

    try {
      const servico: CatalogoServico = {
        id: servicoEmEdicao ? servicoEmEdicao.id : `srv-${Date.now()}`,
        contratoId: contratoAtivo.id,
        nome: nome.trim(),
        grupo,
        codigoReferencia: codigoReferencia.trim() || undefined,
        unidade,
        descricaoPadrao: descricaoPadrao.trim() || undefined,
        observacoesTecnicas: observacoesTecnicas.trim() || undefined,
        larguraPadrao: larguraPadrao !== '' ? Number(larguraPadrao) : undefined,
        espessuraPadrao: espessuraPadrao !== '' ? Number(espessuraPadrao) : undefined,
        ativo: true,
      };

      await onSalvarServico(servico);
      setModalAberto(false);
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar serviço.');
    }
  };

  const carregarServicosPadraoDNIT = async () => {
    if (!contratoAtivo) return;
    setCarregandoPadrao(true);
    try {
      for (const s of SERVICOS_PADRAO_DNIT) {
        await db.catalogoServicos.put({
          id: `srv-${contratoAtivo.id}-${s.nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          contratoId: contratoAtivo.id,
          ...s,
          ativo: true,
        });
      }
      await onRecarregarServicos();
    } finally {
      setCarregandoPadrao(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Seleção de Contrato e Filtros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Catálogo de Serviços por Contrato</h3>
              <p className="text-xs text-slate-500">
                Cada contrato possui seu catálogo com parâmetros de dimensão e unidades
              </p>
            </div>
          </div>

          {/* Seleção do Contrato */}
          {contratos.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Contrato:</span>
              <select
                value={contratoAtivo?.id || ''}
                onChange={(e) => onSelecionarContrato(e.target.value)}
                className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                {contratos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.numeroContrato} - {c.empresaExecutora} ({c.rodovia}/{c.uf})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Linha de busca e filtros */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, código ou especificação..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <select
              value={grupoFiltro}
              onChange={(e) => setGrupoFiltro(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="todos">Todos os Grupos</option>
              {gruposOficiais.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {servicosContrato.length === 0 && (
              <button
                onClick={carregarServicosPadraoDNIT}
                disabled={carregandoPadrao}
                className="flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                {carregandoPadrao ? 'Importando...' : 'Importar Sugestões DNIT'}
              </button>
            )}

            <button
              onClick={abrirModalNovo}
              className="flex items-center gap-1.5 rounded-xl bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Adicionar Serviço
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Serviços Cadastrados */}
      {servicosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <Layers className="h-7 w-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">Nenhum serviço neste contrato</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Adicione serviços específicos deste contrato ou carregue os serviços de referência preconizados pela Norma DNIT 097/2025.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={carregarServicosPadraoDNIT}
              disabled={carregandoPadrao}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100"
            >
              <Sparkles className="h-4 w-4" />
              Importar Catálogo Padrão DNIT
            </button>
            <button
              onClick={abrirModalNovo}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842]"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Manualmente
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicosFiltrados.map((srv) => (
            <div
              key={srv.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800 border border-sky-100 truncate">
                    {srv.grupo}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                      Unidade: {srv.unidade}
                    </span>
                    {srv.codigoReferencia && (
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-700">
                        {srv.codigoReferencia}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="mt-2.5 text-sm font-bold text-slate-900 leading-snug">
                  {srv.nome}
                </h4>

                {srv.descricaoPadrao && (
                  <p className="mt-1.5 text-xs text-slate-600 line-clamp-2">
                    {srv.descricaoPadrao}
                  </p>
                )}

                {srv.observacoesTecnicas && (
                  <p className="mt-1 text-[11px] text-slate-500 italic line-clamp-1">
                    Nota: {srv.observacoesTecnicas}
                  </p>
                )}

                {(srv.larguraPadrao !== undefined || srv.espessuraPadrao !== undefined) && (
                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {srv.larguraPadrao !== undefined && (
                      <span>
                        <strong>Largura típica:</strong> {srv.larguraPadrao.toFixed(2)} m
                      </span>
                    )}
                    {srv.espessuraPadrao !== undefined && (
                      <span>
                        <strong>Espessura:</strong> {srv.espessuraPadrao.toFixed(2)} m
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => abrirModalEditar(srv)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                  title="Editar Serviço"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setServicoParaExcluir(srv.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                  title="Excluir Serviço"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro / Edição de Serviço */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-[#0b3b60] text-white">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <h3 className="text-base font-bold">
                  {servicoEmEdicao ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}
                </h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              {erro && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{erro}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Regularização de Subleito, CBUQ..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grupo de Serviço (Norma DNIT) *
                  </label>
                  <select
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value as GrupoServico)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    {gruposOficiais.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade de Medição *
                  </label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value as UnidadeMedicao)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  >
                    {unidadesMedicao.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Código de Referência / Especificação Técnica (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: DNIT-ES 104, DNIT-ES 107"
                  value={codigoReferencia}
                  onChange={(e) => setCodigoReferencia(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Largura Padrão (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 8.00"
                    value={larguraPadrao}
                    onChange={(e) => setLarguraPadrao(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Espessura Padrão (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0.15"
                    value={espessuraPadrao}
                    onChange={(e) => setEspessuraPadrao(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição Padrão da Atividade
                </label>
                <textarea
                  rows={2}
                  placeholder="Procedimento usual de execução..."
                  value={descricaoPadrao}
                  onChange={(e) => setDescricaoPadrao(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Técnicas / Controle Tecnológico
                </label>
                <textarea
                  rows={2}
                  placeholder="Controle de compactação, ensaios laboratoriais..."
                  value={observacoesTecnicas}
                  onChange={(e) => setObservacoesTecnicas(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      <ConfirmModal
        isOpen={!!servicoParaExcluir}
        title="Excluir Serviço"
        message="Tem certeza que deseja remover este serviço do catálogo do contrato?"
        confirmLabel="Sim, Excluir"
        isDestructive
        onConfirm={async () => {
          if (servicoParaExcluir) {
            await onExcluirServico(servicoParaExcluir);
            setServicoParaExcluir(null);
          }
        }}
        onCancel={() => setServicoParaExcluir(null)}
      />
    </div>
  );
};
