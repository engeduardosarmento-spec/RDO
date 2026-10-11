import React, { useState } from 'react';
import {
  Plus,
  Search,
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Layers,
  Archive,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import type { Contrato } from '../types';
import { formatarDataBR, formatarKm } from '../utils/calculations';
import { ConfirmModal } from './ConfirmModal';

interface ContratosListProps {
  contratos: Contrato[];
  onNovoContrato: () => void;
  onEditarContrato: (contrato: Contrato) => void;
  onVerServicos: (contratoId: string) => void;
  onExcluirContrato: (contratoId: string) => Promise<void>;
  onToggleStatusContrato: (contrato: Contrato) => Promise<void>;
}

export const ContratosList: React.FC<ContratosListProps> = ({
  contratos,
  onNovoContrato,
  onEditarContrato,
  onVerServicos,
  onExcluirContrato,
  onToggleStatusContrato,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'arquivados'>('ativos');
  const [contratoParaExcluir, setContratoParaExcluir] = useState<string | null>(null);

  const contratosFiltrados = contratos.filter((c) => {
    const texto = `${c.numeroContrato} ${c.empresaExecutora} ${c.rodovia} ${c.uf} ${c.nomeObra}`.toLowerCase();
    const bateTexto = texto.includes(busca.toLowerCase());

    if (filtroStatus === 'ativos') return bateTexto && c.ativo;
    if (filtroStatus === 'arquivados') return bateTexto && !c.ativo;
    return bateTexto;
  });

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número, executora, rodovia..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs shadow-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex rounded-xl border border-slate-300 bg-white p-1 shadow-xs text-xs">
            <button
              onClick={() => setFiltroStatus('ativos')}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                filtroStatus === 'ativos'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFiltroStatus('arquivados')}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                filtroStatus === 'arquivados'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Arquivados
            </button>
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`rounded-lg px-3 py-1 font-semibold transition ${
                filtroStatus === 'todos'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        <button
          onClick={onNovoContrato}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Contrato
        </button>
      </div>

      {/* Lista de Contratos */}
      {contratosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <Briefcase className="h-7 w-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">Nenhum contrato encontrado</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {busca
              ? 'Tente ajustar sua busca ou limpar os filtros selecionados.'
              : 'Comece cadastrando o primeiro contrato rodoviário para gerenciar os diários de obra.'}
          </p>
          {!busca && (
            <button
              onClick={onNovoContrato}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842]"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Contrato
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contratosFiltrados.map((contrato) => (
            <div
              key={contrato.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                contrato.ativo ? 'border-slate-200' : 'border-slate-300 bg-slate-50/70 opacity-80'
              }`}
            >
              <div>
                {/* Topo do Card */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">
                        {contrato.numeroContrato}
                      </span>
                      {contrato.processoSei && (
                        <span className="text-[11px] font-mono text-slate-400">
                          SEI: {contrato.processoSei}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          contrato.ativo
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {contrato.ativo ? 'Ativo' : 'Arquivado'}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-slate-900 leading-snug">
                      {contrato.nomeObra}
                    </h3>
                    <p className="text-xs text-slate-500">{contrato.tipoEmpreendimento}</p>
                  </div>
                </div>

                {/* Dados da Obra e Intervenientes */}
                <div className="mt-3.5 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4 shrink-0 text-sky-700" />
                    <span>
                      <strong>{contrato.rodovia}/{contrato.uf}</strong> — {contrato.trecho || 'Trecho não especificado'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 pl-6">
                    Segmento: {formatarKm(contrato.segmentoInicialKm)} ao {formatarKm(contrato.segmentoFinalKm)} ({contrato.extensaoContratualKm} km)
                  </div>

                  <div className="flex items-start gap-2 text-slate-700">
                    <Users className="h-4 w-4 shrink-0 text-sky-700 mt-0.5" />
                    <div className="space-y-0.5">
                      <div>
                        <strong>Executora:</strong> {contrato.empresaExecutora}
                        {contrato.responsavelTecnicoExecutora && ` (${contrato.responsavelTecnicoExecutora})`}
                      </div>
                      {contrato.empresaSupervisora && (
                        <div className="text-slate-500 text-[11px]">
                          <strong>Supervisora:</strong> {contrato.empresaSupervisora}
                        </div>
                      )}
                      <div className="text-slate-500 text-[11px]">
                        <strong>Fiscal DNIT:</strong> {contrato.fiscalDnit}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="h-4 w-4 shrink-0 text-sky-700" />
                    <span>
                      Início: {formatarDataBR(contrato.dataInicio)} • Prazo: {contrato.prazoContratualDias} dias (até {formatarDataBR(contrato.dataPrevisaoConclusao)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Contrato */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onVerServicos(contrato.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition"
                >
                  <Layers className="h-3.5 w-3.5" />
                  Catálogo de Serviços
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditarContrato(contrato)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                    title="Editar Contrato"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onToggleStatusContrato(contrato)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                    title={contrato.ativo ? 'Arquivar Contrato' : 'Reativar Contrato'}
                  >
                    <Archive className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setContratoParaExcluir(contrato.id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition"
                    title="Excluir Contrato"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        isOpen={!!contratoParaExcluir}
        title="Excluir Contrato"
        message="Tem certeza que deseja excluir este contrato? Atenção: RDOs e serviços associados a ele no banco local não poderão mais ser abertos."
        confirmLabel="Sim, Excluir"
        isDestructive
        onConfirm={async () => {
          if (contratoParaExcluir) {
            await onExcluirContrato(contratoParaExcluir);
            setContratoParaExcluir(null);
          }
        }}
        onCancel={() => setContratoParaExcluir(null)}
      />
    </div>
  );
};
