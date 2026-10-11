import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Copy,
  Trash2,
  FileText,
  FileSpreadsheet,
  MessageSquare,
  Archive,
  ChevronRight,
  Calendar,
  X,
} from 'lucide-react';
import type { Rdo, Contrato } from '../types';
import { formatarDataBR, formatarKm } from '../utils/calculations';
import { ConfirmModal } from './ConfirmModal';
import { WhatsAppModal } from './WhatsAppModal';
import { gerarResumoWhatsApp } from '../utils/whatsappGenerator';
import { gerarPdfRdoDnit } from '../utils/pdfExport';
import { gerarExcelRdoDnit } from '../utils/excelExport';

interface RdosListProps {
  rdos: Rdo[];
  contratos: Contrato[];
  onNovoRdo: () => void;
  onEditarRdo: (rdoId: string) => void;
  onDuplicarRdoComoModelo: (rdoOrigem: Rdo) => Promise<void>;
  onExcluirRdo: (rdoId: string) => Promise<void>;
  onAlternarStatusArquivado: (rdo: Rdo) => Promise<void>;
}

export const RdosList: React.FC<RdosListProps> = ({
  rdos,
  contratos,
  onNovoRdo,
  onEditarRdo,
  onDuplicarRdoComoModelo,
  onExcluirRdo,
  onAlternarStatusArquivado,
}) => {
  // Filtros
  const [busca, setBusca] = useState('');
  const [contratoFiltro, setContratoFiltro] = useState<string>('todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [dataInicioFiltro, setDataInicioFiltro] = useState<string>('');
  const [dataFimFiltro, setDataFimFiltro] = useState<string>('');

  // Modais
  const [rdoParaExcluir, setRdoParaExcluir] = useState<string | null>(null);
  const [whatsAppModalAberto, setWhatsAppModalAberto] = useState(false);
  const [rdoParaWhatsApp, setRdoParaWhatsApp] = useState<Rdo | null>(null);

  const getContrato = (contratoId: string) => contratos.find((c) => c.id === contratoId);

  const rdosFiltrados = rdos.filter((r) => {
    const contrato = getContrato(r.contratoId);

    // Filtro por contrato
    if (contratoFiltro !== 'todos' && r.contratoId !== contratoFiltro) {
      return false;
    }

    // Filtro por status
    if (statusFiltro !== 'todos' && r.status !== statusFiltro) {
      return false;
    }

    // Filtro por data
    if (dataInicioFiltro && r.data < dataInicioFiltro) {
      return false;
    }
    if (dataFimFiltro && r.data > dataFimFiltro) {
      return false;
    }

    // Filtro por busca de texto (número, serviço, rodovia, executora)
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      const bateNumero = r.numeroSequencial.toString().includes(termo);
      const bateData = r.data.includes(termo) || formatarDataBR(r.data).includes(termo);
      const bateContrato = contrato?.numeroContrato.toLowerCase().includes(termo);
      const bateExecutora = contrato?.empresaExecutora.toLowerCase().includes(termo);
      const bateRodovia = contrato?.rodovia.toLowerCase().includes(termo);
      const bateServicos = r.servicosExecutados.some(
        (s) =>
          s.nomeServico.toLowerCase().includes(termo) ||
          s.descricaoAtividade.toLowerCase().includes(termo)
      );

      return (
        bateNumero ||
        bateData ||
        bateContrato ||
        bateExecutora ||
        bateRodovia ||
        bateServicos
      );
    }

    return true;
  });

  // Ordenação decrescente por data e número
  const rdosOrdenados = [...rdosFiltrados].sort((a, b) => {
    return b.data.localeCompare(a.data) || b.numeroSequencial - a.numeroSequencial;
  });

  const handleAbrirWhatsApp = (r: Rdo) => {
    setRdoParaWhatsApp(r);
    setWhatsAppModalAberto(true);
  };

  const handleExportarPdf = async (r: Rdo) => {
    const contrato = getContrato(r.contratoId);
    await gerarPdfRdoDnit(r, contrato);
  };

  const handleExportarExcel = (r: Rdo) => {
    const contrato = getContrato(r.contratoId);
    gerarExcelRdoDnit(r, contrato);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Avançados */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número, serviço executado, executora, rodovia..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <button
            onClick={onNovoRdo}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Criar Novo RDO
          </button>
        </div>

        {/* Linha de filtros específicos */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Contrato
            </label>
            <select
              value={contratoFiltro}
              onChange={(e) => setContratoFiltro(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="todos">Todos os Contratos</option>
              {contratos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numeroContrato} - {c.empresaExecutora}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status Interno
            </label>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="todos">Todos os Status</option>
              <option value="em_elaboracao">Em elaboração</option>
              <option value="pronto_revisao">Pronto para revisão</option>
              <option value="finalizado">Finalizado para exportação</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={dataInicioFiltro}
              onChange={(e) => setDataInicioFiltro(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Data Final
            </label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={dataFimFiltro}
                onChange={(e) => setDataFimFiltro(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
              />
              {(dataInicioFiltro || dataFimFiltro || busca || contratoFiltro !== 'todos' || statusFiltro !== 'todos') && (
                <button
                  type="button"
                  onClick={() => {
                    setBusca('');
                    setContratoFiltro('todos');
                    setStatusFiltro('todos');
                    setDataInicioFiltro('');
                    setDataFimFiltro('');
                  }}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-slate-500 hover:bg-slate-100"
                  title="Limpar todos os filtros"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de RDOs */}
      {rdosOrdenados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <FileText className="h-7 w-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-700">Nenhum RDO encontrado</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Não foram encontrados registros para os filtros selecionados. Tente ajustar os parâmetros de pesquisa.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-3.5 text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Registros Diários de Obra Encontrados ({rdosOrdenados.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Ordenados por data decrescente
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">RDO nº</th>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Contrato / Obra</th>
                  <th className="px-5 py-3">Serviços Executados no Dia</th>
                  <th className="px-5 py-3">Clima</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rdosOrdenados.map((r) => {
                  const contrato = getContrato(r.contratoId);
                  const statusColors: Record<string, string> = {
                    em_elaboracao: 'bg-amber-100 text-amber-800 border-amber-200',
                    pronto_revisao: 'bg-blue-100 text-blue-800 border-blue-200',
                    finalizado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    arquivado: 'bg-slate-100 text-slate-700 border-slate-200',
                  };

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition group">
                      <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-900">
                        Nº {r.numeroSequencial.toString().padStart(3, '0')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{formatarDataBR(r.data)}</div>
                        <div className="text-[11px] text-slate-400">{r.diaSemana}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-800">
                          {contrato?.numeroContrato || 'Contrato não localizado'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {contrato?.empresaExecutora} • {contrato?.rodovia}/{contrato?.uf}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {r.servicosExecutados.length > 0 ? (
                          <div className="space-y-0.5">
                            {r.servicosExecutados.slice(0, 2).map((s, idx) => (
                              <div key={idx} className="font-medium text-slate-700 truncate max-w-xs">
                                • {s.nomeServico} ({formatarKm(s.kmInicial)} ao {formatarKm(s.kmFinal)})
                              </div>
                            ))}
                            {r.servicosExecutados.length > 2 && (
                              <div className="text-[10px] text-slate-400">
                                +{r.servicosExecutados.length - 2} outro(s) serviço(s)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sem serviços</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-[11px]">
                        <div>M: {r.climaManha.condicaoTempo} ({r.climaManha.condicaoTrabalho})</div>
                        <div className="text-slate-400">T: {r.climaTarde.condicaoTempo} ({r.climaTarde.condicaoTrabalho})</div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                            statusColors[r.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {r.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditarRdo(r.id)}
                            className="rounded-lg p-1.5 text-slate-600 hover:bg-sky-50 hover:text-sky-700 transition"
                            title="Abrir / Editar RDO"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleAbrirWhatsApp(r)}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                            title="Gerar Resumo WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleExportarPdf(r)}
                            className="rounded-lg p-1.5 text-sky-700 hover:bg-sky-50 transition"
                            title="Exportar PDF (Anexo A DNIT)"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleExportarExcel(r)}
                            className="rounded-lg p-1.5 text-teal-700 hover:bg-teal-50 transition"
                            title="Exportar Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => onDuplicarRdoComoModelo(r)}
                            className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 transition"
                            title="Duplicar como modelo para novo dia (limpando dados diários)"
                          >
                            <Copy className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setRdoParaExcluir(r.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition"
                            title="Excluir RDO"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal WhatsApp */}
      {rdoParaWhatsApp && (
        <WhatsAppModal
          isOpen={whatsAppModalAberto}
          onClose={() => setWhatsAppModalAberto(false)}
          textoInicial={gerarResumoWhatsApp(rdoParaWhatsApp, getContrato(rdoParaWhatsApp.contratoId))}
          rdoNumero={rdoParaWhatsApp.numeroSequencial}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!rdoParaExcluir}
        title="Excluir RDO"
        message="Tem certeza que deseja excluir permanentemente este Registro Diário de Obra do banco local? Esta ação não pode ser desfeita."
        confirmLabel="Sim, Excluir"
        isDestructive
        onConfirm={async () => {
          if (rdoParaExcluir) {
            await onExcluirRdo(rdoParaExcluir);
            setRdoParaExcluir(null);
          }
        }}
        onCancel={() => setRdoParaExcluir(null)}
      />
    </div>
  );
};
