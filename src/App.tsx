import React, { useState, useEffect } from 'react';
import { db, carregarDadosDemonstrativos } from './db/database';
import type {
  Contrato,
  CatalogoServico,
  Rdo,
  EquipePredefinida,
  EquipamentoPredefinido,
} from './types';
import { Sidebar, type NavegacaoAba } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ContratosList } from './components/ContratosList';
import { ContratoFormModal } from './components/ContratoFormModal';
import { ServicosCatalogo } from './components/ServicosCatalogo';
import { RdoWizard } from './components/RdoWizard/RdoWizard';
import { RdosList } from './components/RdosList';
import { ProfissionaisEquipes } from './components/ProfissionaisEquipes';
import { BackupConfiguracoes } from './components/BackupConfiguracoes';
import { obterDiaSemanaExtenso, calcularPrazosContratuais } from './utils/calculations';

export function App() {
  const [abaAtiva, setAbaAtiva] = useState<NavegacaoAba>('dashboard');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregandoDemo, setCarregandoDemo] = useState(false);

  // Dados do banco
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [catalogoServicos, setCatalogoServicos] = useState<CatalogoServico[]>([]);
  const [rdos, setRdos] = useState<Rdo[]>([]);
  const [equipes, setEquipes] = useState<EquipePredefinida[]>([]);
  const [equipamentos, setEquipamentos] = useState<EquipamentoPredefinido[]>([]);

  // Estados de seleção e edição
  const [contratoAtivoId, setContratoAtivoId] = useState<string>('');
  const [rdoEmEdicao, setRdoEmEdicao] = useState<Rdo | null>(null);
  const [modalContratoAberto, setModalContratoAberto] = useState(false);
  const [contratoEmEdicao, setContratoEmEdicao] = useState<Contrato | null>(null);

  // Carrega todos os dados do Dexie IndexedDB
  const carregarDadosDoBanco = async () => {
    try {
      const [listaContratos, listaServicos, listaRdos, listaEquipes, listaEquipamentos] =
        await Promise.all([
          db.contratos.toArray(),
          db.catalogoServicos.toArray(),
          db.rdos.toArray(),
          db.equipesPredefinidas.toArray(),
          db.equipamentosPredefinidos.toArray(),
        ]);

      setContratos(listaContratos);
      setCatalogoServicos(listaServicos);
      setRdos(listaRdos);
      setEquipes(listaEquipes);
      setEquipamentos(listaEquipamentos);

      if (listaContratos.length > 0 && !contratoAtivoId) {
        setContratoAtivoId(listaContratos[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do IndexedDB:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, []);

  const contratoAtivo = contratos.find((c) => c.id === contratoAtivoId) || contratos[0];

  // Ação para criar um novo RDO
  const handleCriarNovoRdo = (contratoIdParam?: string) => {
    const cId = contratoIdParam || contratoAtivoId || (contratos[0] ? contratos[0].id : '');
    const contratoSelecionado = contratos.find((c) => c.id === cId);

    const hoje = new Date().toISOString().split('T')[0];
    const diaSemana = obterDiaSemanaExtenso(hoje);

    // Calcula próximo sequencial por contrato
    const rdosDoContrato = rdos.filter((r) => r.contratoId === cId);
    const maiorSequencial = rdosDoContrato.reduce(
      (max, cur) => Math.max(max, cur.numeroSequencial || 0),
      0
    );
    const novoSequencial = maiorSequencial + 1;

    let prazos = {
      prazoDecorrido: 0,
      prazoAVencer: contratoSelecionado?.prazoContratualDias || 365,
    };

    if (contratoSelecionado?.dataInicio) {
      const res = calcularPrazosContratuais(
        contratoSelecionado.dataInicio,
        hoje,
        contratoSelecionado.prazoContratualDias,
        contratoSelecionado.dataPrevisaoConclusao
      );
      prazos = {
        prazoDecorrido: res.prazoDecorrido,
        prazoAVencer: res.prazoAVencer,
      };
    }

    const novoRdo: Rdo = {
      id: `rdo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      contratoId: cId,
      numeroSequencial: novoSequencial,
      data: hoje,
      diaSemana,
      status: 'em_elaboracao',

      prazoContratualDias: contratoSelecionado?.prazoContratualDias || 365,
      prazoDecorridoDias: prazos.prazoDecorrido,
      prazoAVencerDias: prazos.prazoAVencer,

      climaManha: {
        condicaoTempo: 'Bom',
        condicaoTrabalho: 'Praticável',
        observacoes: '',
      },
      climaTarde: {
        condicaoTempo: 'Bom',
        condicaoTrabalho: 'Praticável',
        observacoes: '',
      },
      ocorrenciasMeteorologicas: '',

      apontador: '',
      encarregado: '',
      outrosResponsaveis: '',
      maoDeObra: [],

      equipamentos: [],
      servicosExecutados: [],

      semRestricoes: true,
      restricoesCategorias: {
        Pessoal: false,
        Equipamentos: false,
        Instalações: false,
        'Cronograma físico': false,
        Qualidade: false,
        'Atendimento à fiscalização': false,
        'Administração da obra': false,
        'Meio ambiente': false,
      },
      eventosRestricoes: [],

      comentarios: [],
      ordensServico: [],

      consideracoesConstrutora: '',
      consideracoesSupervisora: '',
      consideracoesFiscalizacao: '',

      fotografias: [],

      identificacaoResponsaveis: {
        executora: {
          nome: contratoSelecionado?.responsavelTecnicoExecutora || '',
          cargo: 'Engenheiro Residente da Executora',
          email: contratoSelecionado?.emailResponsavelExecutora || '',
          artCrea: contratoSelecionado?.artCreaExecutora || '',
        },
        supervisora: {
          nome: contratoSelecionado?.responsavelTecnicoSupervisora || '',
          cargo: 'Engenheiro Supervisor',
          email: contratoSelecionado?.emailResponsavelSupervisora || '',
          artCrea: contratoSelecionado?.artCreaSupervisora || '',
        },
        fiscalizacaoDnit: {
          nome: contratoSelecionado?.fiscalDnit || '',
          cargo: 'Fiscal do Contrato - DNIT',
          email: contratoSelecionado?.emailFiscalDnit || '',
          portaria: contratoSelecionado?.portariaFiscal || '',
        },
      },

      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    setRdoEmEdicao(novoRdo);
    setAbaAtiva('novo_rdo');
  };

  // Abrir RDO existente para edição
  const handleEditarRdo = (rdoId: string) => {
    const rdo = rdos.find((r) => r.id === rdoId);
    if (rdo) {
      setRdoEmEdicao(rdo);
      setContratoAtivoId(rdo.contratoId);
      setAbaAtiva('novo_rdo');
    }
  };

  // Duplicar RDO como modelo para nova data (conforme item 17)
  const handleDuplicarRdoComoModelo = async (rdoOrigem: Rdo) => {
    const contratoSelecionado = contratos.find((c) => c.id === rdoOrigem.contratoId);
    const hoje = new Date().toISOString().split('T')[0];
    const diaSemana = obterDiaSemanaExtenso(hoje);

    // Próximo número sequencial único
    const rdosDoContrato = rdos.filter((r) => r.contratoId === rdoOrigem.contratoId);
    const maiorSequencial = rdosDoContrato.reduce(
      (max, cur) => Math.max(max, cur.numeroSequencial || 0),
      0
    );
    const novoSequencial = maiorSequencial + 1;

    let prazos = {
      prazoDecorrido: 0,
      prazoAVencer: rdoOrigem.prazoContratualDias,
    };
    if (contratoSelecionado?.dataInicio) {
      const res = calcularPrazosContratuais(
        contratoSelecionado.dataInicio,
        hoje,
        contratoSelecionado.prazoContratualDias,
        contratoSelecionado.dataPrevisaoConclusao
      );
      prazos = {
        prazoDecorrido: res.prazoDecorrido,
        prazoAVencer: res.prazoAVencer,
      };
    }

    // Mantém estrutura da equipe e equipamentos como modelo, mas limpa dados diários voláteis
    const novoRdo: Rdo = {
      ...rdoOrigem,
      id: `rdo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      numeroSequencial: novoSequencial,
      data: hoje,
      diaSemana,
      status: 'em_elaboracao',

      prazoDecorridoDias: prazos.prazoDecorrido,
      prazoAVencerDias: prazos.prazoAVencer,

      // Clima limpo para novo preenchimento
      climaManha: {
        condicaoTempo: 'Bom',
        condicaoTrabalho: 'Praticável',
        observacoes: '',
      },
      climaTarde: {
        condicaoTempo: 'Bom',
        condicaoTrabalho: 'Praticável',
        observacoes: '',
      },
      ocorrenciasMeteorologicas: '',

      // Limpa ocorrências, comentários e fotografias conforme norma
      semRestricoes: true,
      restricoesCategorias: {
        Pessoal: false,
        Equipamentos: false,
        Instalações: false,
        'Cronograma físico': false,
        Qualidade: false,
        'Atendimento à fiscalização': false,
        'Administração da obra': false,
        'Meio ambiente': false,
      },
      eventosRestricoes: [],
      comentarios: [],
      ordensServico: [],
      consideracoesConstrutora: '',
      consideracoesSupervisora: '',
      consideracoesFiscalizacao: '',
      fotografias: [],

      // Mantém os serviços como modelo mas com status 'Em_execucao'
      servicosExecutados: rdoOrigem.servicosExecutados.map((s) => ({
        ...s,
        id: `se-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        situacao: 'Em_execucao',
        observacoes: '',
      })),

      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    await db.rdos.put(novoRdo);
    await carregarDadosDoBanco();
    setRdoEmEdicao(novoRdo);
    setAbaAtiva('novo_rdo');
  };

  const handleExcluirRdo = async (rdoId: string) => {
    await db.rdos.delete(rdoId);
    await carregarDadosDoBanco();
    if (rdoEmEdicao?.id === rdoId) {
      setRdoEmEdicao(null);
      setAbaAtiva('rdos');
    }
  };

  const handleAlternarStatusArquivado = async (rdo: Rdo) => {
    const novoStatus = rdo.status === 'arquivado' ? 'pronto_revisao' : 'arquivado';
    await db.rdos.update(rdo.id, { status: novoStatus, atualizadoEm: new Date().toISOString() });
    await carregarDadosDoBanco();
  };

  // Gestão de Contratos
  const handleSalvarContrato = async (contrato: Contrato) => {
    await db.contratos.put(contrato);
    await carregarDadosDoBanco();
    setContratoAtivoId(contrato.id);
  };

  const handleExcluirContrato = async (contratoId: string) => {
    await db.contratos.delete(contratoId);
    await carregarDadosDoBanco();
    if (contratoAtivoId === contratoId) {
      setContratoAtivoId(contratos[0]?.id || '');
    }
  };

  const handleToggleStatusContrato = async (contrato: Contrato) => {
    await db.contratos.update(contrato.id, {
      ativo: !contrato.ativo,
      atualizadoEm: new Date().toISOString(),
    });
    await carregarDadosDoBanco();
  };

  // Gestão de Serviços
  const handleSalvarServico = async (servico: CatalogoServico) => {
    await db.catalogoServicos.put(servico);
    await carregarDadosDoBanco();
  };

  const handleExcluirServico = async (servicoId: string) => {
    await db.catalogoServicos.delete(servicoId);
    await carregarDadosDoBanco();
  };

  // Equipes e Equipamentos
  const handleSalvarEquipe = async (eq: EquipePredefinida) => {
    await db.equipesPredefinidas.put(eq);
    await carregarDadosDoBanco();
  };

  const handleExcluirEquipe = async (id: string) => {
    await db.equipesPredefinidas.delete(id);
    await carregarDadosDoBanco();
  };

  const handleSalvarEquipamento = async (eq: EquipamentoPredefinido) => {
    await db.equipamentosPredefinidos.put(eq);
    await carregarDadosDoBanco();
  };

  const handleExcluirEquipamento = async (id: string) => {
    await db.equipamentosPredefinidos.delete(id);
    await carregarDadosDoBanco();
  };

  // Carregar dados de demonstração
  const handleCarregarDemo = async () => {
    setCarregandoDemo(true);
    try {
      const demoId = await carregarDadosDemonstrativos();
      await carregarDadosDoBanco();
      setContratoAtivoId(demoId);
    } finally {
      setCarregandoDemo(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      {/* Sidebar de navegação */}
      <Sidebar
        abaAtiva={abaAtiva}
        onSelecionarAba={(aba) => {
          if (aba === 'novo_rdo' && !rdoEmEdicao) {
            handleCriarNovoRdo();
          } else {
            setAbaAtiva(aba);
          }
        }}
        isOpenMobile={menuMobileAberto}
        onCloseMobile={() => setMenuMobileAberto(false)}
      />

      {/* Conteúdo Principal */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar
          abaAtiva={abaAtiva}
          onOpenMobileMenu={() => setMenuMobileAberto(true)}
          onNovoRdo={() => handleCriarNovoRdo()}
          contratos={contratos}
          contratoAtivoId={contratoAtivoId}
          onSelecionarContratoAtivo={(id) => setContratoAtivoId(id)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {carregando ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
            </div>
          ) : (
            <>
              {abaAtiva === 'dashboard' && (
                <Dashboard
                  contratos={contratos}
                  rdos={rdos}
                  onNavegar={(aba) => {
                    if (aba === 'novo_rdo') handleCriarNovoRdo();
                    else setAbaAtiva(aba);
                  }}
                  onEditarRdo={handleEditarRdo}
                  onCarregarDemo={handleCarregarDemo}
                  carregandoDemo={carregandoDemo}
                />
              )}

              {abaAtiva === 'contratos' && (
                <ContratosList
                  contratos={contratos}
                  onNovoContrato={() => {
                    setContratoEmEdicao(null);
                    setModalContratoAberto(true);
                  }}
                  onEditarContrato={(c) => {
                    setContratoEmEdicao(c);
                    setModalContratoAberto(true);
                  }}
                  onVerServicos={(cId) => {
                    setContratoAtivoId(cId);
                    setAbaAtiva('servicos');
                  }}
                  onExcluirContrato={handleExcluirContrato}
                  onToggleStatusContrato={handleToggleStatusContrato}
                />
              )}

              {abaAtiva === 'servicos' && (
                <ServicosCatalogo
                  contratos={contratos}
                  contratoSelecionadoId={contratoAtivoId}
                  onSelecionarContrato={(id) => setContratoAtivoId(id)}
                  servicos={catalogoServicos}
                  onSalvarServico={handleSalvarServico}
                  onExcluirServico={handleExcluirServico}
                  onRecarregarServicos={carregarDadosDoBanco}
                />
              )}

              {abaAtiva === 'novo_rdo' && (
                <RdoWizard
                  rdoInicial={
                    rdoEmEdicao || {
                      id: `rdo-${Date.now()}`,
                      contratoId: contratoAtivo?.id || '',
                      numeroSequencial: 1,
                      data: new Date().toISOString().split('T')[0],
                      diaSemana: obterDiaSemanaExtenso(new Date().toISOString().split('T')[0]),
                      status: 'em_elaboracao',
                      prazoContratualDias: contratoAtivo?.prazoContratualDias || 365,
                      prazoDecorridoDias: 0,
                      prazoAVencerDias: contratoAtivo?.prazoContratualDias || 365,
                      climaManha: { condicaoTempo: 'Bom', condicaoTrabalho: 'Praticável' },
                      climaTarde: { condicaoTempo: 'Bom', condicaoTrabalho: 'Praticável' },
                      apontador: '',
                      encarregado: '',
                      maoDeObra: [],
                      equipamentos: [],
                      servicosExecutados: [],
                      semRestricoes: true,
                      restricoesCategorias: {
                        Pessoal: false,
                        Equipamentos: false,
                        Instalações: false,
                        'Cronograma físico': false,
                        Qualidade: false,
                        'Atendimento à fiscalização': false,
                        'Administração da obra': false,
                        'Meio ambiente': false,
                      },
                      eventosRestricoes: [],
                      comentarios: [],
                      ordensServico: [],
                      consideracoesConstrutora: '',
                      consideracoesSupervisora: '',
                      consideracoesFiscalizacao: '',
                      fotografias: [],
                      identificacaoResponsaveis: {
                        executora: {
                          nome: contratoAtivo?.responsavelTecnicoExecutora || '',
                          cargo: 'Responsável Técnico Executora',
                          email: contratoAtivo?.emailResponsavelExecutora || '',
                        },
                        supervisora: {
                          nome: contratoAtivo?.responsavelTecnicoSupervisora || '',
                          cargo: 'Responsável Técnico Supervisora',
                          email: contratoAtivo?.emailResponsavelSupervisora || '',
                        },
                        fiscalizacaoDnit: {
                          nome: contratoAtivo?.fiscalDnit || '',
                          cargo: 'Fiscal do Contrato - DNIT',
                          email: contratoAtivo?.emailFiscalDnit || '',
                        },
                      },
                      criadoEm: new Date().toISOString(),
                      atualizadoEm: new Date().toISOString(),
                    }
                  }
                  contratos={contratos}
                  catalogoServicos={catalogoServicos}
                  rdosExistentes={rdos}
                  onVoltarParaLista={() => setAbaAtiva('rdos')}
                />
              )}

              {abaAtiva === 'rdos' && (
                <RdosList
                  rdos={rdos}
                  contratos={contratos}
                  onNovoRdo={() => handleCriarNovoRdo()}
                  onEditarRdo={handleEditarRdo}
                  onDuplicarRdoComoModelo={handleDuplicarRdoComoModelo}
                  onExcluirRdo={handleExcluirRdo}
                  onAlternarStatusArquivado={handleAlternarStatusArquivado}
                />
              )}

              {abaAtiva === 'equipes' && (
                <ProfissionaisEquipes
                  contratos={contratos}
                  equipes={equipes}
                  equipamentos={equipamentos}
                  onSalvarEquipe={handleSalvarEquipe}
                  onExcluirEquipe={handleExcluirEquipe}
                  onSalvarEquipamento={handleSalvarEquipamento}
                  onExcluirEquipamento={handleExcluirEquipamento}
                />
              )}

              {abaAtiva === 'configuracoes' && (
                <BackupConfiguracoes onDadosModificados={carregarDadosDoBanco} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal de Contrato */}
      <ContratoFormModal
        isOpen={modalContratoAberto}
        onClose={() => setModalContratoAberto(false)}
        contratoEmEdicao={contratoEmEdicao}
        onSalvar={handleSalvarContrato}
      />
    </div>
  );
}

export default App;
