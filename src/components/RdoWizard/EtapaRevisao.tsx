import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  MessageSquare,
  Building,
  Calendar,
  Users,
  Truck,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  Download,
  AlertCircle,
} from 'lucide-react';
import type { Rdo, Contrato, StatusRdo } from '../../types';
import {
  formatarDataBR,
  formatarKm,
  formatarMetros,
  formatarArea,
  formatarVolume,
} from '../../utils/calculations';

interface EtapaRevisaoProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
  contrato?: Contrato;
  onNavegarEtapa: (numeroEtapa: number) => void;
  onGerarWhatsApp: () => void;
  onExportarPdf: () => void;
  onExportarExcel: () => void;
}

export const EtapaRevisao: React.FC<EtapaRevisaoProps> = ({
  rdo,
  onChange,
  contrato,
  onNavegarEtapa,
  onGerarWhatsApp,
  onExportarPdf,
  onExportarExcel,
}) => {
  // Verificação de pendências
  const pendencias: Array<{ campo: string; mensagem: string; etapa: number }> = [];

  if (!rdo.contratoId) {
    pendencias.push({ campo: 'Contrato', mensagem: 'Nenhum contrato vinculado.', etapa: 1 });
  }
  if (!rdo.data) {
    pendencias.push({ campo: 'Data', mensagem: 'Data do RDO não informada.', etapa: 1 });
  }
  if (!rdo.apontador && !rdo.encarregado) {
    pendencias.push({ campo: 'Equipe', mensagem: 'Informe o apontador ou encarregado de campo.', etapa: 3 });
  }
  if (rdo.servicosExecutados.length === 0) {
    pendencias.push({ campo: 'Serviços', mensagem: 'Nenhum serviço registrado no período.', etapa: 5 });
  }
  rdo.servicosExecutados.forEach((s, idx) => {
    if (s.kmFinal < s.kmInicial) {
      pendencias.push({
        campo: `Serviço ${idx + 1}`,
        mensagem: `Km final inferior ao km inicial em "${s.nomeServico}".`,
        etapa: 5,
      });
    }
  });

  const handleStatusChange = (novoStatus: StatusRdo) => {
    onChange({ status: novoStatus });
  };

  return (
    <div className="space-y-6">
      {/* Bloco 1: Status Interno do RDO e Validação */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Status Interno e Validação do Documento
            </h3>
            <p className="text-xs text-slate-500">
              Gerencie o fluxo de preenchimento e exportação do diário de obra
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { valor: 'em_elaboracao', label: 'Em elaboração' },
                { valor: 'pronto_revisao', label: 'Pronto para revisão' },
                { valor: 'finalizado', label: 'Finalizado para exportação' },
                { valor: 'arquivado', label: 'Arquivado' },
              ] as const
            ).map((st) => (
              <button
                key={st.valor}
                type="button"
                onClick={() => handleStatusChange(st.valor)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition border ${
                  rdo.status === st.valor
                    ? 'bg-[#0b3b60] text-white border-[#0b3b60] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notificação legal sobre status */}
        <div className="text-[11px] text-slate-500 italic">
          <strong>Aviso Normativo:</strong> O status &ldquo;Finalizado para exportação&rdquo; é um controle interno da ferramenta e não substitui nem representa aprovação ou visto formal do DNIT ou da Supervisora.
        </div>

        {/* Lista de pendências se houver */}
        {pendencias.length > 0 && (
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Pendências Detectadas ({pendencias.length}):</span>
            </div>
            <div className="space-y-1 text-xs text-amber-800">
              {pendencias.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span>• <strong>{p.campo}:</strong> {p.mensagem}</span>
                  <button
                    type="button"
                    onClick={() => onNavegarEtapa(p.etapa)}
                    className="text-[11px] font-bold text-sky-700 underline hover:text-sky-900 ml-2"
                  >
                    Corrigir na Etapa {p.etapa}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bloco 2: Ações de Exportação Rápidas */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Opções de Exportação e Compartilhamento
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onGerarWhatsApp}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
          >
            <MessageSquare className="h-4 w-4" />
            Gerar Resumo para WhatsApp
          </button>

          <button
            type="button"
            onClick={onExportarPdf}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0b3b60] px-4 py-3 text-xs font-bold text-white hover:bg-[#082842] transition shadow-xs"
          >
            <FileText className="h-4 w-4" />
            Exportar RDO em PDF (Anexo A)
          </button>

          <button
            type="button"
            onClick={onExportarExcel}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-xs font-bold text-white hover:bg-teal-800 transition shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar RDO em Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Bloco 3: Visualização do Documento (Simulação visual do Modelo Anexo A) */}
      <div className="rounded-2xl border-2 border-slate-300 bg-white shadow-md overflow-hidden text-xs">
        {/* Topo Oficial */}
        <div className="bg-[#0b3b60] p-4 text-white text-center">
          <div className="font-extrabold text-sm tracking-wide">
            DEPARTAMENTO NACIONAL DE INFRAESTRUTURA DE TRANSPORTES — DNIT
          </div>
          <div className="text-xs text-sky-200 mt-0.5">
            REGISTRO DE DIÁRIO DE OBRA — RDO (NORMA DNIT 097/2025 – PRO)
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Identificação Geral */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-slate-200 pb-4 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 font-sans">RDO Nº:</span>{' '}
              <strong>{rdo.numeroSequencial.toString().padStart(4, '0')}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-sans">DATA:</span>{' '}
              <strong>{formatarDataBR(rdo.data)} ({rdo.diaSemana})</strong>
            </div>
            <div>
              <span className="text-slate-500 font-sans">CONTRATO:</span>{' '}
              <strong>{contrato?.numeroContrato || 'Não informado'}</strong>
            </div>
          </div>

          {/* Dados Contratuais */}
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 space-y-1 leading-relaxed">
            <div>
              <strong>Obra:</strong> {contrato?.nomeObra} ({contrato?.tipoEmpreendimento})
            </div>
            <div>
              <strong>Localização:</strong> {contrato?.rodovia}/{contrato?.uf} — Trecho: {contrato?.trecho || '-'}
            </div>
            <div>
              <strong>Segmento Contratual:</strong> {formatarKm(contrato?.segmentoInicialKm)} ao {formatarKm(contrato?.segmentoFinalKm)} ({contrato?.extensaoContratualKm} km)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 mt-2 font-mono text-[11px]">
              <div>Prazo: {rdo.prazoContratualDias} dias</div>
              <div>Decorrido: {rdo.prazoDecorridoDias} dias</div>
              <div>A vencer: {rdo.prazoAVencerDias} dias</div>
              <div>Executora: {contrato?.empresaExecutora}</div>
            </div>
          </div>

          {/* Clima */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
              Condições Climáticas
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 p-3">
              <div>
                <strong>Manhã:</strong> {rdo.climaManha.condicaoTempo} — Condição de trabalho:{' '}
                <span className="font-bold">{rdo.climaManha.condicaoTrabalho}</span>
                {rdo.climaManha.observacoes && <p className="text-slate-500 mt-0.5">{rdo.climaManha.observacoes}</p>}
              </div>
              <div className="sm:pl-3">
                <strong>Tarde:</strong> {rdo.climaTarde.condicaoTempo} — Condição de trabalho:{' '}
                <span className="font-bold">{rdo.climaTarde.condicaoTrabalho}</span>
                {rdo.climaTarde.observacoes && <p className="text-slate-500 mt-0.5">{rdo.climaTarde.observacoes}</p>}
              </div>
            </div>
          </div>

          {/* Mão de Obra e Equipamentos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 p-3 space-y-1">
              <div className="font-bold uppercase text-[11px] text-slate-700 border-b border-slate-200 pb-1">
                Efetivo de Campo
              </div>
              <div className="text-[11px]">
                <strong>Apontador:</strong> {rdo.apontador || '-'} | <strong>Encarregado:</strong> {rdo.encarregado || '-'}
              </div>
              <div className="text-[11px] text-slate-600">
                Direta: {rdo.maoDeObra.filter((m) => m.categoria === 'direta').reduce((a, b) => a + b.quantidade, 0)} colaboradores • Indireta: {rdo.maoDeObra.filter((m) => m.categoria === 'indireta').reduce((a, b) => a + b.quantidade, 0)} colaboradores
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 space-y-1">
              <div className="font-bold uppercase text-[11px] text-slate-700 border-b border-slate-200 pb-1">
                Equipamentos
              </div>
              <div className="text-[11px] text-slate-600">
                Total: {rdo.equipamentos.reduce((a, b) => a + b.quantidade, 0)} equipamentos (
                {rdo.equipamentos.filter((e) => e.situacao === 'operacional').reduce((a, b) => a + b.quantidade, 0)} operacionais)
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {rdo.equipamentos.map((e) => `${e.quantidade}x ${e.descricao}`).join(', ')}
              </div>
            </div>
          </div>

          {/* Serviços Desenvolvidos */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-700">
              Serviços Desenvolvidos no Período
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Serviço</th>
                    <th className="p-2">Segmento</th>
                    <th className="p-2 text-right">Extensão</th>
                    <th className="p-2 text-right">Área</th>
                    <th className="p-2 text-right">Volume</th>
                    <th className="p-2">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rdo.servicosExecutados.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="p-2 font-bold">{idx + 1}</td>
                      <td className="p-2 font-medium">{s.nomeServico}</td>
                      <td className="p-2 whitespace-nowrap">
                        {formatarKm(s.kmInicial)} ao {formatarKm(s.kmFinal)}
                      </td>
                      <td className="p-2 text-right font-mono">
                        {formatarMetros(s.extensaoInformadaMetros || s.extensaoCalculadaMetros)}
                      </td>
                      <td className="p-2 text-right font-mono">{formatarArea(s.areaCalculadaM2)}</td>
                      <td className="p-2 text-right font-mono">{formatarVolume(s.volumeCalculadoM3)}</td>
                      <td className="p-2 whitespace-nowrap">
                        <span className="font-semibold">{s.situacao.replace('_', ' ')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Restrições */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-1">
            <div className="font-bold uppercase text-[11px] text-slate-700 border-b border-slate-200 pb-1">
              Eventos com Restrições (Anexo A)
            </div>
            {rdo.semRestricoes || rdo.eventosRestricoes.length === 0 ? (
              <div className="text-slate-600 italic">Sem restrições registradas no período.</div>
            ) : (
              <div className="space-y-1 pt-1">
                {rdo.eventosRestricoes.map((ev, i) => (
                  <div key={ev.id} className="text-[11px] text-slate-700">
                    • <strong>[{ev.categoria}]</strong> {ev.descricao} (Providência: {ev.providencia})
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Responsáveis / Assinatura */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-center text-[11px]">
            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900">
                {rdo.identificacaoResponsaveis?.executora?.nome || contrato?.responsavelTecnicoExecutora || 'Responsável Construtora'}
              </div>
              <div className="text-slate-500">Empresa Executora</div>
              <div className="mt-4 pt-2 border-t border-slate-300 text-[10px] text-slate-400">
                Assinatura do Responsável Técnico
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900">
                {rdo.identificacaoResponsaveis?.supervisora?.nome || contrato?.responsavelTecnicoSupervisora || 'Responsável Supervisora'}
              </div>
              <div className="text-slate-500">Empresa Supervisora</div>
              <div className="mt-4 pt-2 border-t border-slate-300 text-[10px] text-slate-400">
                Assinatura do Supervisor
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg">
              <div className="font-bold text-slate-900">
                {rdo.identificacaoResponsaveis?.fiscalizacaoDnit?.nome || contrato?.fiscalDnit || 'Fiscal do DNIT'}
              </div>
              <div className="text-slate-500">Fiscalização do DNIT</div>
              <div className="mt-4 pt-2 border-t border-slate-300 text-[10px] text-slate-400">
                Visto do Fiscal do Contrato
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
