import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Layers,
  PlusCircle,
  Users,
  Database,
  BookOpen,
} from 'lucide-react';

export type NavegacaoAba =
  | 'dashboard'
  | 'contratos'
  | 'servicos'
  | 'novo_rdo'
  | 'rdos'
  | 'equipes'
  | 'configuracoes';

interface SidebarProps {
  abaAtiva: NavegacaoAba;
  onSelecionarAba: (aba: NavegacaoAba) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  abaAtiva,
  onSelecionarAba,
  isOpenMobile,
  onCloseMobile,
}) => {
  const itensMenu = [
    {
      id: 'dashboard' as NavegacaoAba,
      label: 'Painel Inicial',
      icon: LayoutDashboard,
      descricao: 'Visão geral e indicadores',
    },
    {
      id: 'contratos' as NavegacaoAba,
      label: 'Contratos',
      icon: Briefcase,
      descricao: 'Gestão de contratos e obras',
    },
    {
      id: 'servicos' as NavegacaoAba,
      label: 'Cadastro de Serviços',
      icon: Layers,
      descricao: 'Catálogo de serviços por contrato',
    },
    {
      id: 'novo_rdo' as NavegacaoAba,
      label: 'Novo RDO',
      icon: PlusCircle,
      destaque: true,
      descricao: 'Preencher diário de obra',
    },
    {
      id: 'rdos' as NavegacaoAba,
      label: 'RDOs Registrados',
      icon: FileText,
      descricao: 'Consulta, PDF, Excel e WhatsApp',
    },
    {
      id: 'equipes' as NavegacaoAba,
      label: 'Profissionais e Equipes',
      icon: Users,
      descricao: 'Efetivo e maquinário',
    },
    {
      id: 'configuracoes' as NavegacaoAba,
      label: 'Backup e Configurações',
      icon: Database,
      descricao: 'Exportação JSON e restauração',
    },
  ];

  const handleItemClick = (id: NavegacaoAba) => {
    onSelecionarAba(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Barra lateral */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b2840] text-slate-100 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-0 lg:translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="flex h-20 items-center gap-3 border-b border-sky-950/60 px-5 bg-[#082035]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500 font-extrabold text-white shadow-md">
            <span className="text-sm tracking-tighter">DNIT</span>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-white tracking-tight truncate">
              RDO Digital
            </h1>
            <p className="text-[11px] font-medium text-sky-300 truncate">
              Norma DNIT 097/2025 – PRO
            </p>
          </div>
        </div>

        {/* Lista de navegação */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navegação Principal
          </div>

          {itensMenu.map((item) => {
            const Icon = item.icon;
            const ativo = abaAtiva === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition ${
                  ativo
                    ? 'bg-sky-600 text-white shadow-md font-semibold'
                    : item.destaque
                    ? 'bg-sky-950/70 text-sky-200 hover:bg-sky-900 hover:text-white border border-sky-800/60'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition ${
                    ativo ? 'text-white' : item.destaque ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{item.label}</div>
                  <div
                    className={`text-[11px] truncate ${
                      ativo ? 'text-sky-100' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {item.descricao}
                  </div>
                </div>
                {item.destaque && !ativo && (
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Rodapé da Sidebar */}
        <div className="border-t border-sky-950/80 p-4 bg-[#071c2e]">
          <div className="rounded-lg bg-sky-950/60 p-3 border border-sky-800/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-200">
              <BookOpen className="h-4 w-4 text-sky-400" />
              <span>Norma DNIT 097/2025</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-snug">
              Procedimento de Registro de Diário de Obra — Anexos A e B
            </p>
          </div>
          <div className="mt-2 text-center text-[10px] text-slate-500">
            Armazenamento Local • Versão 1.0
          </div>
        </div>
      </aside>
    </>
  );
};
