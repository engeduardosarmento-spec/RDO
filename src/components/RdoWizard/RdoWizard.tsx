import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Sun,
  Users,
  Truck,
  Layers,
  AlertOctagon,
  MessageSquare,
  Building,
  Camera,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import type { Rdo, Contrato, CatalogoServico } from '../../types';
import { db } from '../../db/database';
import { EtapaIdentificacao } from './EtapaIdentificacao';
import { EtapaClima } from './EtapaClima';
import { EtapaMaoDeObra } from './EtapaMaoDeObra';
import { EtapaEquipamentos } from './EtapaEquipamentos';
import { EtapaServicos } from './EtapaServicos';
import { EtapaRestricoes } from './EtapaRestricoes';
import { EtapaComentarios } from './EtapaComentarios';
import { EtapaConsideracoes } from './EtapaConsideracoes';
import { EtapaFotos } from './EtapaFotos';
import { EtapaRevisao } from './EtapaRevisao';
import { WhatsAppModal } from '../WhatsAppModal';
import { gerarResumoWhatsApp } from '../../utils/whatsappGenerator';
import { gerarPdfRdoDnit } from '../../utils/pdfExport';
import { gerarExcelRdoDnit } from '../../utils/excelExport';

interface RdoWizardProps {
  rdoInicial: Rdo;
  contratos: Contrato[];
  catalogoServicos: CatalogoServico[];
  rdosExistentes: Rdo[];
  onVoltarParaLista: () => void;
}

const etapas = [
  { numero: 1, label: '1. Identificação', icone: Calendar },
  { numero: 2, label: '2. Clima', icone: Sun },
  { numero: 3, label: '3. Mão de Obra', icone: Users },
  { numero: 4, label: '4. Equipamentos', icone: Truck },
  { numero: 5, label: '5. Serviços Executados', icone: Layers, destaque: true },
  { numero: 6, label: '6. Restrições', icone: AlertOctagon },
  { numero: 7, label: '7. Comentários', icone: MessageSquare },
  { numero: 8, label: '8. Considerações', icone: Building },
  { numero: 9, label: '9. Fotografias', icone: Camera },
  { numero: 10, label: '10. Revisão & Encerramento', icone: FileCheck },
];

export const RdoWizard: React.FC<RdoWizardProps> = ({
  rdoInicial,
  contratos,
  catalogoServicos,
  rdosExistentes,
  onVoltarParaLista,
}) => {
  const [rdo, setRdo] = useState<Rdo>(rdoInicial);
  const [etapaAtiva, setEtapaAtiva] = useState(1);
  const [statusSalvo, setStatusSalvo] = useState<'salvo' | 'salvando'>('salvo');
  const [whatsAppModalAberto, setWhatsAppModalAberto] = useState(false);
  const [textoWhatsApp, setTextoWhatsApp] = useState('');

  const contratoAtual = contratos.find((c) => c.id === rdo.contratoId) || contratos[0];
  const autosaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Autosave contínuo no IndexedDB com debounce
  const salvarNoBanco = async (rdoParaSalvar: Rdo) => {
    setStatusSalvo('salvando');
    try {
      const atualizadoComTimestamp: Rdo = {
        ...rdoParaSalvar,
        atualizadoEm: new Date().toISOString(),
      };
      await db.rdos.put(atualizadoComTimestamp);
      setStatusSalvo('salvo');
    } catch (err) {
      console.error('Erro no autosave:', err);
    }
  };

  const handleAtualizarRdo = (atualizacao: Partial<Rdo>) => {
    setRdo((prev) => {
      const proximo = { ...prev, ...atualizacao };

      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
      autosaveTimeout.current = setTimeout(() => {
        salvarNoBanco(proximo);
      }, 500);

      return proximo;
    });
  };

  const handleSalvarManual = async () => {
    await salvarNoBanco(rdo);
  };

  const handleAbrirWhatsApp = () => {
    const texto = gerarResumoWhatsApp(rdo, contratoAtual);
    setTextoWhatsApp(texto);
    setWhatsAppModalAberto(true);
  };

  const handleExportarPdf = async () => {
    await salvarNoBanco(rdo);
    await gerarPdfRdoDnit(rdo, contratoAtual);
  };

  const handleExportarExcel = async () => {
    await salvarNoBanco(rdo);
    gerarExcelRdoDnit(rdo, contratoAtual);
  };

  const proximaEtapa = () => {
    if (etapaAtiva < etapas.length) {
      setEtapaAtiva(etapaAtiva + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const etapaAnterior = () => {
    if (etapaAtiva > 1) {
      setEtapaAtiva(etapaAtiva - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra Superior do Wizard */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltarParaLista}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">
                RDO nº {rdo.numeroSequencial}
              </span>
              <span className="text-xs font-bold text-slate-800">
                {contratoAtual?.numeroContrato}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{rdo.data}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Indicador de Salvamento */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 border border-slate-200/80">
            <HardDrive className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-[11px] font-medium">
              {statusSalvo === 'salvando' ? 'Salvando...' : 'Salvo no navegador'}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                statusSalvo === 'salvando' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={handleSalvarManual}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            Salvar
          </button>

          <button
            type="button"
            onClick={() => setEtapaAtiva(10)}
            className="flex items-center gap-1.5 rounded-lg bg-[#0b3b60] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#082842] shadow-xs"
          >
            <FileCheck className="h-3.5 w-3.5" />
            Revisar & Exportar
          </button>
        </div>
      </div>

      {/* Navegação por Etapas (Stepper com rolagem horizontal no mobile) */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-1 min-w-max rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
          {etapas.map((et) => {
            const Icon = et.icone;
            const ativa = etapaAtiva === et.numero;

            return (
              <button
                key={et.numero}
                type="button"
                onClick={() => setEtapaAtiva(et.numero)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  ativa
                    ? 'bg-[#0b3b60] text-white shadow-xs'
                    : et.destaque
                    ? 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${ativa ? 'text-white' : 'text-slate-400'}`} />
                <span>{et.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Etapa Atual */}
      <div className="transition-all duration-150">
        {etapaAtiva === 1 && (
          <EtapaIdentificacao
            rdo={rdo}
            onChange={handleAtualizarRdo}
            contratos={contratos}
            rdosExistentes={rdosExistentes}
          />
        )}

        {etapaAtiva === 2 && (
          <EtapaClima rdo={rdo} onChange={handleAtualizarRdo} />
        )}

        {etapaAtiva === 3 && (
          <EtapaMaoDeObra
            rdo={rdo}
            onChange={handleAtualizarRdo}
            rdosAnteriores={rdosExistentes}
          />
        )}

        {etapaAtiva === 4 && (
          <EtapaEquipamentos rdo={rdo} onChange={handleAtualizarRdo} />
        )}

        {etapaAtiva === 5 && (
          <EtapaServicos
            rdo={rdo}
            onChange={handleAtualizarRdo}
            contrato={contratoAtual}
            catalogoServicos={catalogoServicos}
          />
        )}

        {etapaAtiva === 6 && (
          <EtapaRestricoes rdo={rdo} onChange={handleAtualizarRdo} />
        )}

        {etapaAtiva === 7 && (
          <EtapaComentarios rdo={rdo} onChange={handleAtualizarRdo} />
        )}

        {etapaAtiva === 8 && (
          <EtapaConsideracoes rdo={rdo} onChange={handleAtualizarRdo} />
        )}

        {etapaAtiva === 9 && (
          <EtapaFotos rdo={rdo} onChange={handleAtualizarRdo} />
        )}

        {etapaAtiva === 10 && (
          <EtapaRevisao
            rdo={rdo}
            onChange={handleAtualizarRdo}
            contrato={contratoAtual}
            onNavegarEtapa={(num) => setEtapaAtiva(num)}
            onGerarWhatsApp={handleAbrirWhatsApp}
            onExportarPdf={handleExportarPdf}
            onExportarExcel={handleExportarExcel}
          />
        )}
      </div>

      {/* Barra de Navegação Inferior (Anterior / Próxima) */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <button
          type="button"
          onClick={etapaAnterior}
          disabled={etapaAtiva === 1}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4" />
          Etapa Anterior
        </button>

        <div className="text-xs text-slate-500 font-semibold">
          Etapa {etapaAtiva} de {etapas.length}
        </div>

        {etapaAtiva < etapas.length ? (
          <button
            type="button"
            onClick={proximaEtapa}
            className="flex items-center gap-1.5 rounded-xl bg-[#0b3b60] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#082842] transition shadow-xs"
          >
            Próxima Etapa
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleExportarPdf}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
          >
            <FileCheck className="h-4 w-4" />
            Concluir & Exportar PDF
          </button>
        )}
      </div>

      {/* Modal de WhatsApp */}
      <WhatsAppModal
        isOpen={whatsAppModalAberto}
        onClose={() => setWhatsAppModalAberto(false)}
        textoInicial={textoWhatsApp}
        rdoNumero={rdo.numeroSequencial}
      />
    </div>
  );
};
