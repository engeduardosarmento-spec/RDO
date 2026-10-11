import React, { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  FileJson,
  Info,
} from 'lucide-react';
import {
  exportarBackupCompleto,
  restaurarBackupCompleto,
  limparTodosOsDados,
  carregarDadosDemonstrativos,
} from '../db/database';
import { ConfirmModal } from './ConfirmModal';

interface BackupConfiguracoesProps {
  onDadosModificados: () => Promise<void>;
}

export const BackupConfiguracoes: React.FC<BackupConfiguracoesProps> = ({
  onDadosModificados,
}) => {
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [modalLimparAberto, setModalLimparAberto] = useState(false);
  const [processando, setProcessando] = useState(false);

  const handleExportarBackup = async () => {
    try {
      setProcessando(true);
      const jsonBackup = await exportarBackupCompleto();
      const blob = new Blob([jsonBackup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dataHora = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `backup_rdo_dnit_${dataHora}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMensagemSucesso('Backup JSON exportado com sucesso para o seu dispositivo!');
      setTimeout(() => setMensagemSucesso(null), 5000);
    } catch (err: any) {
      setMensagemErro(`Erro ao exportar backup: ${err.message}`);
    } finally {
      setProcessando(false);
    }
  };

  const handleImportarBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessando(true);
    setMensagemErro(null);
    setMensagemSucesso(null);

    const reader = new FileReader();
    reader.onload = async (evento) => {
      try {
        const conteudo = evento.target?.result as string;
        const res = await restaurarBackupCompleto(conteudo);
        await onDadosModificados();
        setMensagemSucesso(
          `Backup restaurado com sucesso! (${res.contratos} contratos, ${res.servicos} serviços e ${res.rdos} RDOs importados).`
        );
      } catch (err: any) {
        setMensagemErro(`Falha na restauração: ${err.message}`);
      } finally {
        setProcessando(false);
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      setMensagemErro('Erro ao ler o arquivo selecionado.');
      setProcessando(false);
    };
    reader.readAsText(file);
  };

  const handleCarregarExemplo = async () => {
    setProcessando(true);
    try {
      await carregarDadosDemonstrativos();
      await onDadosModificados();
      setMensagemSucesso(
        'Dados demonstrativos de referência carregados com sucesso (LCM / BR-364 / Contrato SR-593/2020)!'
      );
      setTimeout(() => setMensagemSucesso(null), 6000);
    } catch (err: any) {
      setMensagemErro(`Erro ao carregar exemplo: ${err.message}`);
    } finally {
      setProcessando(false);
    }
  };

  const handleLimparDados = async () => {
    setProcessando(true);
    try {
      await limparTodosOsDados();
      await onDadosModificados();
      setModalLimparAberto(false);
      setMensagemSucesso('Todos os dados locais foram apagados com sucesso.');
      setTimeout(() => setMensagemSucesso(null), 5000);
    } catch (err: any) {
      setMensagemErro(`Erro ao limpar dados: ${err.message}`);
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {mensagemSucesso && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {mensagemErro && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-800 border border-red-200 shadow-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{mensagemErro}</span>
        </div>
      )}

      {/* Bloco 1: Esclarecimento sobre o Armazenamento Local */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-6 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-sky-950">
              Arquitetura de Armazenamento Local (IndexedDB)
            </h3>
            <p className="mt-1 text-xs text-sky-900 leading-relaxed">
              O aplicativo foi projetado para operar com autonomia e velocidade mesmo sem conexão à internet. Todos os contratos, serviços, relatórios e fotografias ficam salvos de forma persistente diretamente no banco de dados <strong>IndexedDB</strong> deste navegador.
            </p>
            <div className="mt-3 rounded-lg bg-white/80 p-3 text-[11px] text-sky-950 border border-sky-200/60">
              <strong>Importante para os engenheiros e supervisores:</strong> Como os dados residem localmente neste dispositivo, utilize a opção de <strong>Exportar Backup JSON</strong> para salvaguardar seus registros ou transferi-los para outro computador ou celular.
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 2: Exportação e Importação de Backup JSON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exportar Backup */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Download className="h-4 w-4 text-sky-700" />
              <span>Exportar Backup Completo</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Gera um arquivo JSON contendo todos os contratos, catálogo de serviços, RDOs preenchidos, equipes e metadados. Ideal para arquivamento seguro ou transferência.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportarBackup}
            disabled={processando}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#0b3b60] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#082842] transition shadow-xs disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Baixar Backup JSON (.json)
          </button>
        </div>

        {/* Restaurar Backup */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Upload className="h-4 w-4 text-sky-700" />
              <span>Restaurar Backup JSON</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Carregue um arquivo de backup previamente gerado para restaurar seus contratos e diários de obra neste dispositivo com validação estrutural.
            </p>
          </div>

          <label className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer transition shadow-xs">
            <Upload className="h-4 w-4 text-slate-600" />
            <span>Selecionar Arquivo JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportarBackup}
              disabled={processando}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Bloco 3: Dados de Demonstração e Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carregar Demonstração */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <span>Carregar Dados Demonstrativos (Item 1)</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Popula o sistema com os dados de referência da Norma DNIT 097/2025:
              <br />• <strong>Empresa:</strong> LCM Construção e Comércio S/A
              <br />• <strong>Contrato:</strong> SR-593/2020 (BR-364/AC)
              <br />• <strong>RDO de 30/09/2026:</strong> Regularização de Subleito e Revestimento Primário 02 (km 272,600 ao 273,100).
            </p>
          </div>

          <button
            type="button"
            onClick={handleCarregarExemplo}
            disabled={processando}
            className="flex items-center justify-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-800 hover:bg-sky-100 transition shadow-xs disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-sky-600" />
            Carregar Exemplo de Referência
          </button>
        </div>

        {/* Limpeza de Dados */}
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-800">
              <Trash2 className="h-4 w-4 text-red-600" />
              <span>Limpar Todos os Dados Locais</span>
            </div>
            <p className="mt-2 text-xs text-red-700 leading-relaxed">
              Remove todos os contratos, serviços e RDOs armazenados no banco IndexedDB deste navegador. Esta ação é irreversível.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalLimparAberto(true)}
            disabled={processando}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-xs disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Apagar Banco de Dados Local
          </button>
        </div>
      </div>

      {/* Confirmação de Reset Geral */}
      <ConfirmModal
        isOpen={modalLimparAberto}
        title="Apagar Todos os Dados"
        message="Atenção: todos os contratos, RDOs, fotos e cadastros armazenados no navegador serão permanentemente apagados. Recomendamos exportar um backup antes de prosseguir. Deseja continuar?"
        confirmLabel="Sim, Apagar Tudo"
        isDestructive
        onConfirm={handleLimparDados}
        onCancel={() => setModalLimparAberto(false)}
      />
    </div>
  );
};
