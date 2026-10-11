import React from 'react';
import {
  FileText,
  Briefcase,
  Layers,
  PlusCircle,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type { Contrato, Rdo } from '../types';
import type { NavegacaoAba } from './Sidebar';
import { formatarDataBR, formatarKm } from '../utils/calculations';

interface DashboardProps {
  contratos: Contrato[];
  rdos: Rdo[];
  onNavegar: (aba: NavegacaoAba) => void;
  onEditarRdo: (rdoId: string) => void;
  onCarregarDemo: () => Promise<void>;
  carregandoDemo: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  contratos,
  rdos,
  onNavegar,
  onEditarRdo,
  onCarregarDemo,
  carregandoDemo,
}) => {
  // Cálculos reais com base nos dados armazenados
  const totalContratos = contratos.length;
  const totalRdos = rdos.length;

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  const rdosMesAtual = rdos.filter((r) => {
    try {
      const d = new Date(r.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    } catch {
      return false;
    }
  }).length;

  const rdosEmElaboracao = rdos.filter((r) => r.status === 'em_elaboracao' || r.status === 'pronto_revisao').length;
  const rdosFinalizados = rdos.filter((r) => r.status === 'finalizado').length;

  // Últimos 5 registros ordenados por data decrescente
  const ultimosRdos = [...rdos]
    .sort((a, b) => b.data.localeCompare(a.data) || b.numeroSequencial - a.numeroSequencial)
    .slice(0, 5);

  const getContrato = (contratoId: string) => contratos.find((c) => c.id === contratoId);

  return (
    <div className="space-y-6">
      {/* Banner de boas-vindas / introdução técnica */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0b3b60] via-[#0e4d7d] to-[#125e98] p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold text-sky-200 border border-sky-300/20 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              <span>Conformidade com a Norma DNIT 097/2025 – PRO</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Sistema de Registro de Diário de Obra Digital
            </h1>
            <p className="mt-1 text-sm text-sky-100 max-w-2xl leading-relaxed">
              Plataforma para preenchimento ágil em campo, cálculo de extensões e volumes geométricos, registro de eventos com restrições e emissão padronizada em PDF, Excel e WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavegar('novo_rdo')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#0b3b60] hover:bg-sky-50 transition shadow-md"
            >
              <PlusCircle className="h-4 w-4 text-[#0b3b60]" />
              Criar Novo RDO
            </button>
            {totalContratos === 0 && (
              <button
                onClick={onCarregarDemo}
                disabled={carregandoDemo}
                className="flex items-center gap-2 rounded-xl bg-sky-400/20 border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-400/30 transition"
              >
                {carregandoDemo ? 'Carregando...' : 'Carregar Exemplo de Referência'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cartões Estatísticos Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Contratos */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contratos
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalContratos}</span>
            <span className="text-xs text-slate-500">cadastrado{totalContratos !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Total RDOs */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total de RDOs
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalRdos}</span>
            <span className="text-xs text-slate-500">registro{totalRdos !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* RDOs Mês Atual */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              RDOs no Mês
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{rdosMesAtual}</span>
            <span className="text-xs text-slate-500">neste mês</span>
          </div>
        </div>

        {/* RDOs Em Elaboração */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Em Elaboração
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{rdosEmElaboracao}</span>
            <span className="text-xs text-slate-500">pendente{rdosEmElaboracao !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* RDOs Finalizados */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Finalizados
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{rdosFinalizados}</span>
            <span className="text-xs text-slate-500">prontos</span>
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavegar('novo_rdo')}
            className="flex items-center justify-between rounded-lg border border-sky-100 bg-sky-50/70 p-3.5 text-left hover:bg-sky-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0b3b60] text-white">
                <PlusCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Criar Novo RDO</div>
                <div className="text-xs text-slate-500">Preenchimento diário</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => onNavegar('contratos')}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 text-left hover:bg-slate-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-700 text-white">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Cadastrar Contrato</div>
                <div className="text-xs text-slate-500">Nova obra rodoviária</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => onNavegar('servicos')}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 text-left hover:bg-slate-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-700 text-white">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Catálogo de Serviços</div>
                <div className="text-xs text-slate-500">Norma DNIT 097/2025</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => onNavegar('rdos')}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 text-left hover:bg-slate-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 text-white">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Consultar RDOs</div>
                <div className="text-xs text-slate-500">Filtros, PDF e Excel</div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* Tabela dos Últimos RDOs Realizados */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Últimos Registros Realizados</h3>
            <p className="text-xs text-slate-500">Histórico mais recente armazenado localmente</p>
          </div>
          {ultimosRdos.length > 0 && (
            <button
              onClick={() => onNavegar('rdos')}
              className="flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900"
            >
              Ver todos os {totalRdos} registros
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {ultimosRdos.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <FileText className="h-7 w-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">Nenhum RDO registrado ainda</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Inicie cadastrando o seu contrato e criando o primeiro Registro Diário de Obra, ou carregue os dados de exemplo da Norma DNIT.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => onNavegar('novo_rdo')}
                className="rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] shadow-xs"
              >
                Criar Primeiro RDO
              </button>
              <button
                onClick={onCarregarDemo}
                disabled={carregandoDemo}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {carregandoDemo ? 'Carregando...' : 'Carregar Exemplo Demonstrativo'}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">RDO nº</th>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Contrato / Obra</th>
                  <th className="px-5 py-3">Serviços Executados</th>
                  <th className="px-5 py-3">Clima</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ultimosRdos.map((r) => {
                  const contrato = getContrato(r.contratoId);
                  const statusColors: Record<string, string> = {
                    em_elaboracao: 'bg-amber-100 text-amber-800 border-amber-200',
                    pronto_revisao: 'bg-blue-100 text-blue-800 border-blue-200',
                    finalizado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    arquivado: 'bg-slate-100 text-slate-700 border-slate-200',
                  };

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
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
                                • {s.nomeServico} ({formatarKm(s.kmInicial)} - {formatarKm(s.kmFinal)})
                              </div>
                            ))}
                            {r.servicosExecutados.length > 2 && (
                              <div className="text-[10px] text-slate-400">
                                +{r.servicosExecutados.length - 2} outro(s) serviço(s)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sem serviços lançados</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-[11px]">
                          M: {r.climaManha.condicaoTempo} ({r.climaManha.condicaoTrabalho})
                        </span>
                        <br />
                        <span className="text-[11px] text-slate-400">
                          T: {r.climaTarde.condicaoTempo} ({r.climaTarde.condicaoTrabalho})
                        </span>
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
                        <button
                          onClick={() => onEditarRdo(r.id)}
                          className="rounded-md bg-slate-100 hover:bg-sky-50 hover:text-sky-700 px-3 py-1.5 font-medium text-slate-700 transition"
                        >
                          Abrir / Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
