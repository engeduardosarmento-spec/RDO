import React from 'react';
import { Menu, PlusCircle, CheckCircle2, HardDrive } from 'lucide-react';
import type { NavegacaoAba } from './Sidebar';
import type { Contrato } from '../types';

interface NavbarProps {
  abaAtiva: NavegacaoAba;
  onOpenMobileMenu: () => void;
  onNovoRdo: () => void;
  contratos: Contrato[];
  contratoAtivoId?: string;
  onSelecionarContratoAtivo: (id: string) => void;
}

const titulosAba: Record<NavegacaoAba, { titulo: string; subtitulo: string }> = {
  dashboard: {
    titulo: 'Painel Inicial',
    subtitulo: 'Visão executiva dos contratos e diários de obra',
  },
  contratos: {
    titulo: 'Gestão de Contratos',
    subtitulo: 'Cadastro de obras rodoviárias, intervenientes e trechos',
  },
  servicos: {
    titulo: 'Catálogo de Serviços',
    subtitulo: 'Serviços cadastrados por contrato conforme grupos da Norma DNIT',
  },
  novo_rdo: {
    titulo: 'Elaboração de RDO',
    subtitulo: 'Preenchimento sequencial do diário de obra (Norma 097/2025)',
  },
  rdos: {
    titulo: 'RDOs Registrados',
    subtitulo: 'Consulta, filtros, emissão em PDF, Excel e resumo WhatsApp',
  },
  equipes: {
    titulo: 'Profissionais e Equipes',
    subtitulo: 'Gestão de equipes de campo e maquinário frequente',
  },
  configuracoes: {
    titulo: 'Backup e Configurações',
    subtitulo: 'Persistência no navegador, exportação e restauração JSON',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  abaAtiva,
  onOpenMobileMenu,
  onNovoRdo,
  contratos,
  contratoAtivoId,
  onSelecionarContratoAtivo,
}) => {
  const infoAba = titulosAba[abaAtiva] || {
    titulo: 'RDO Digital',
    subtitulo: 'Diário de Obra DNIT',
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-hidden"
          title="Abrir menu lateral"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
            {infoAba.titulo}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {infoAba.subtitulo}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Seletor de Contrato Ativo */}
        {contratos.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Contrato:
            </span>
            <select
              value={contratoAtivoId || ''}
              onChange={(e) => onSelecionarContratoAtivo(e.target.value)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white focus:border-blue-500 focus:outline-hidden max-w-[200px] truncate"
            >
              {contratos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.numeroContrato} - {c.empresaExecutora}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Indicador de persistência local */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 border border-slate-200/60" title="Dados armazenados no IndexedDB do seu navegador">
          <HardDrive className="h-3.5 w-3.5 text-emerald-600" />
          <span className="font-medium">IndexedDB Ativo</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Botão Novo RDO */}
        {abaAtiva !== 'novo_rdo' && (
          <button
            onClick={onNovoRdo}
            className="flex items-center gap-2 rounded-lg bg-[#0b3b60] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#082842] transition shadow-xs"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden xs:inline">Novo RDO</span>
          </button>
        )}
      </div>
    </header>
  );
};
