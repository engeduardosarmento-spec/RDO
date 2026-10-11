import React, { useEffect } from 'react';
import { Calendar, Clock, Hash, MapPin, Building, AlertCircle } from 'lucide-react';
import type { Rdo, Contrato } from '../../types';
import { calcularPrazosContratuais, obterDiaSemanaExtenso, formatarDataBR, formatarKm } from '../../utils/calculations';

interface EtapaIdentificacaoProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
  contratos: Contrato[];
  rdosExistentes: Rdo[];
}

export const EtapaIdentificacao: React.FC<EtapaIdentificacaoProps> = ({
  rdo,
  onChange,
  contratos,
  rdosExistentes,
}) => {
  const contratoAtual = contratos.find((c) => c.id === rdo.contratoId) || contratos[0];

  // Atualiza dia da semana e prazos quando a data muda
  useEffect(() => {
    if (rdo.data) {
      const diaSemana = obterDiaSemanaExtenso(rdo.data);
      let prazos = {
        prazoDecorrido: rdo.prazoDecorridoDias,
        prazoAVencer: rdo.prazoAVencerDias,
      };

      if (contratoAtual?.dataInicio) {
        const resultadoPrazos = calcularPrazosContratuais(
          contratoAtual.dataInicio,
          rdo.data,
          contratoAtual.prazoContratualDias,
          contratoAtual.dataPrevisaoConclusao
        );
        prazos = {
          prazoDecorrido: resultadoPrazos.prazoDecorrido,
          prazoAVencer: resultadoPrazos.prazoAVencer,
        };
      }

      onChange({
        diaSemana,
        prazoDecorridoDias: prazos.prazoDecorrido,
        prazoAVencerDias: prazos.prazoAVencer,
        prazoContratualDias: contratoAtual?.prazoContratualDias || rdo.prazoContratualDias || 365,
      });
    }
  }, [rdo.data, rdo.contratoId]);

  const handleContratoChange = (contratoId: string) => {
    const contratoSelecionado = contratos.find((c) => c.id === contratoId);
    if (!contratoSelecionado) return;

    // Calcula próximo número sequencial para esse contrato
    const rdosDesteContrato = rdosExistentes.filter((r) => r.contratoId === contratoId && r.id !== rdo.id);
    const maiorNumero = rdosDesteContrato.reduce((max, cur) => Math.max(max, cur.numeroSequencial || 0), 0);
    const novoSequencial = maiorNumero + 1;

    let prazos = {
      prazoDecorrido: 0,
      prazoAVencer: contratoSelecionado.prazoContratualDias,
    };

    if (contratoSelecionado.dataInicio && rdo.data) {
      const res = calcularPrazosContratuais(
        contratoSelecionado.dataInicio,
        rdo.data,
        contratoSelecionado.prazoContratualDias,
        contratoSelecionado.dataPrevisaoConclusao
      );
      prazos = {
        prazoDecorrido: res.prazoDecorrido,
        prazoAVencer: res.prazoAVencer,
      };
    }

    onChange({
      contratoId,
      numeroSequencial: novoSequencial,
      prazoContratualDias: contratoSelecionado.prazoContratualDias,
      prazoDecorridoDias: prazos.prazoDecorrido,
      prazoAVencerDias: prazos.prazoAVencer,
      identificacaoResponsaveis: {
        executora: {
          nome: contratoSelecionado.responsavelTecnicoExecutora || '',
          cargo: 'Engenheiro Residente da Executora',
          email: contratoSelecionado.emailResponsavelExecutora || '',
          artCrea: contratoSelecionado.artCreaExecutora || '',
        },
        supervisora: {
          nome: contratoSelecionado.responsavelTecnicoSupervisora || '',
          cargo: 'Engenheiro Supervisor',
          email: contratoSelecionado.emailResponsavelSupervisora || '',
          artCrea: contratoSelecionado.artCreaSupervisora || '',
        },
        fiscalizacaoDnit: {
          nome: contratoSelecionado.fiscalDnit || '',
          cargo: 'Fiscal do Contrato - DNIT',
          email: contratoSelecionado.emailFiscalDnit || '',
          portaria: contratoSelecionado.portariaFiscal || '',
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Bloco 1: Seleção do Contrato e Número do RDO */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Building className="h-4 w-4 text-sky-700" />
          <span>Contrato e Identificação do Registro</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contrato da Obra *
            </label>
            <select
              value={rdo.contratoId}
              onChange={(e) => handleContratoChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
            >
              {contratos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numeroContrato} — {c.empresaExecutora} ({c.rodovia}/{c.uf})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número Sequencial do RDO *
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                required
                value={rdo.numeroSequencial}
                onChange={(e) => onChange({ numeroSequencial: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-semibold">
                Sequencial único
              </span>
            </div>
          </div>
        </div>

        {/* Dados preenchidos automaticamente do contrato */}
        {contratoAtual && (
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200/80 text-xs space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-500">Obra:</span> <strong>{contratoAtual.nomeObra}</strong>
              </div>
              <div>
                <span className="text-slate-500">Localização:</span>{' '}
                <strong>
                  {contratoAtual.rodovia}/{contratoAtual.uf} ({formatarKm(contratoAtual.segmentoInicialKm)} ao{' '}
                  {formatarKm(contratoAtual.segmentoFinalKm)})
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Executora:</span>{' '}
                <strong>{contratoAtual.empresaExecutora}</strong>
              </div>
              <div>
                <span className="text-slate-500">Supervisora:</span>{' '}
                <strong>{contratoAtual.empresaSupervisora || 'Não cadastrada'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Fiscal DNIT:</span>{' '}
                <strong>{contratoAtual.fiscalDnit}</strong>
              </div>
              <div>
                <span className="text-slate-500">Superintendência:</span>{' '}
                <strong>{contratoAtual.superintendenciaRegional} ({contratoAtual.unidadeLocal})</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bloco 2: Data e Dia da Semana */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Calendar className="h-4 w-4 text-sky-700" />
          <span>Data do Relatório e Dia da Semana</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Data do Diário de Obra (RDO) *
            </label>
            <input
              type="date"
              required
              value={rdo.data}
              onChange={(e) => onChange({ data: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dia da Semana (Automático)
            </label>
            <input
              type="text"
              readOnly
              value={rdo.diaSemana || ''}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-default"
            />
          </div>
        </div>
      </div>

      {/* Bloco 3: Prazos Contratuais Calculados */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <Clock className="h-4 w-4 text-sky-700" />
            <span>Prazos Contratuais</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Base: {formatarDataBR(contratoAtual?.dataInicio)} a {formatarDataBR(contratoAtual?.dataPrevisaoConclusao)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prazo Contratual Total (dias)
            </label>
            <input
              type="number"
              value={rdo.prazoContratualDias}
              onChange={(e) => onChange({ prazoContratualDias: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prazo Decorrido (dias corridos)
            </label>
            <input
              type="number"
              value={rdo.prazoDecorridoDias}
              onChange={(e) => onChange({ prazoDecorridoDias: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prazo a Vencer (dias restantes)
            </label>
            <input
              type="number"
              value={rdo.prazoAVencerDias}
              onChange={(e) => onChange({ prazoAVencerDias: parseInt(e.target.value) || 0 })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-semibold text-emerald-700"
            />
          </div>
        </div>

        <div className="rounded-lg bg-sky-50/60 p-3 text-[11px] text-sky-900 border border-sky-100 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-sky-600 mt-0.5" />
          <span>
            <strong>Regra de Cálculo DNIT:</strong> O prazo decorrido contabiliza os dias corridos entre o início oficial da obra ({formatarDataBR(contratoAtual?.dataInicio)}) e a data do relatório. Você pode ajustar manualmente os valores caso haja suspensão ou aditivo de prazo.
          </span>
        </div>
      </div>
    </div>
  );
};
