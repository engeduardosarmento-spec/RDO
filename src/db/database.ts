import Dexie, { type Table } from 'dexie';
import type {
  Contrato,
  CatalogoServico,
  Rdo,
  EquipePredefinida,
  EquipamentoPredefinido,
} from '../types';

export class RdoDatabase extends Dexie {
  contratos!: Table<Contrato, string>;
  catalogoServicos!: Table<CatalogoServico, string>;
  rdos!: Table<Rdo, string>;
  equipesPredefinidas!: Table<EquipePredefinida, string>;
  equipamentosPredefinidos!: Table<EquipamentoPredefinido, string>;

  constructor() {
    super('RdoDigitalDnitDb');
    this.version(1).stores({
      contratos: 'id, numeroContrato, ativo, criadoEm',
      catalogoServicos: 'id, contratoId, nome, grupo, ativo',
      rdos: 'id, contratoId, numeroSequencial, data, status, criadoEm',
      equipesPredefinidas: 'id, contratoId, nome',
      equipamentosPredefinidos: 'id, descricao',
    });
  }
}

export const db = new RdoDatabase();

// Serviços padrão de referência sugeridos pela Norma DNIT 097/2025 – PRO Anexo B
export const SERVICOS_PADRAO_DNIT: Array<Omit<CatalogoServico, 'id' | 'contratoId' | 'ativo'>> = [
  {
    nome: 'Regularização de Subleito',
    grupo: 'Implantação',
    codigoReferencia: 'DNIT-ES 104',
    unidade: 'm²',
    descricaoPadrao: 'Conformação da pista com motoniveladora, escarificação, umedecimento e compactação.',
    observacoesTecnicas: 'Verificar grau de compactação e greide conforme projeto.',
    larguraPadrao: 9.0,
    espessuraPadrao: 0.2,
  },
  {
    nome: 'Reforço do Subleito',
    grupo: 'Implantação',
    codigoReferencia: 'DNIT-ES 105',
    unidade: 'm³',
    descricaoPadrao: 'Camada de reforço granular ou estabilizada.',
    larguraPadrao: 9.0,
    espessuraPadrao: 0.2,
  },
  {
    nome: 'Sub-base Granular',
    grupo: 'Pavimentação — pista e acostamento',
    codigoReferencia: 'DNIT-ES 139',
    unidade: 'm³',
    descricaoPadrao: 'Execução de sub-base estabilizada granulometricamente.',
    larguraPadrao: 8.4,
    espessuraPadrao: 0.15,
  },
  {
    nome: 'Base de Brita Graduada',
    grupo: 'Pavimentação — pista e acostamento',
    codigoReferencia: 'DNIT-ES 141',
    unidade: 'm³',
    descricaoPadrao: 'Execução de base de brita graduada tratada ou simples.',
    larguraPadrao: 8.0,
    espessuraPadrao: 0.15,
  },
  {
    nome: 'Revestimento Primário 02',
    grupo: 'Pavimentação — pista e acostamento',
    codigoReferencia: 'DNIT-ES 107',
    unidade: 'm²',
    descricaoPadrao: 'Espalhamento, conformação e compactação de material terroso/cascalho selecionado.',
    observacoesTecnicas: 'Garantir espessura de projeto e abaulamento de pista.',
    larguraPadrao: 8.0,
    espessuraPadrao: 0.15,
  },
  {
    nome: 'Imprimação Betuminosa',
    grupo: 'Pavimentação — pista e acostamento',
    codigoReferencia: 'DNIT-ES 144',
    unidade: 'm²',
    descricaoPadrao: 'Aplicação de ligante asfáltico tipo CM-30 sobre a base concluída.',
    larguraPadrao: 8.0,
  },
  {
    nome: 'Pintura de Ligação',
    grupo: 'Pavimentação — pista e acostamento',
    codigoReferencia: 'DNIT-ES 145',
    unidade: 'm²',
    descricaoPadrao: 'Aplicação de emulsão RR-1C sobre camada asfáltica precedente.',
    larguraPadrao: 7.2,
  },
  {
    nome: 'Concreto Asfáltico (CBUQ)',
    grupo: 'Pavimentação — pista e acostamento',
    codigoReferencia: 'DNIT-ES 031',
    unidade: 't',
    descricaoPadrao: 'Aplicação de mistura asfáltica usinada a quente para camada de rolamento.',
    larguraPadrao: 7.2,
    espessuraPadrao: 0.05,
  },
  {
    nome: 'Drenagem Superficial — Sarjeta de Concreto',
    grupo: 'Drenagem e obras de arte',
    codigoReferencia: 'DNIT-ES 018',
    unidade: 'm',
    descricaoPadrao: 'Execução de sarjeta triangular ou trapezoidal de concreto.',
  },
  {
    nome: 'Bueiro Tubular de Concreto (BTC)',
    grupo: 'Drenagem e obras de arte',
    codigoReferencia: 'DNIT-ES 023',
    unidade: 'm',
    descricaoPadrao: 'Assentamento de tubos de concreto e execução de berço.',
  },
  {
    nome: 'Sinalização Horizontal — Pintura de Faixas',
    grupo: 'Obras complementares',
    codigoReferencia: 'DNIT-ES 100',
    unidade: 'm²',
    descricaoPadrao: 'Aplicação de tinta retrorefletiva para demarcação de eixo e bordas.',
  },
  {
    nome: 'Roçada e Limpeza de Faixa de Domínio',
    grupo: 'Obras complementares',
    codigoReferencia: 'DNIT-ES 098',
    unidade: 'm²',
    descricaoPadrao: 'Corte de vegetação rasteira e limpeza das margens da rodovia.',
  },
];

/**
 * Carrega os dados demonstrativos de referência descritos no Item 1 do brief:
 * - LCM Construção e Comércio S/A
 * - Contrato: SR-593/2020
 * - Data: 30/09/2026
 * - BR-364/AC
 * - 2 Serviços detalhados (Regularização de Subleito e Revestimento Primário 02)
 */
export async function carregarDadosDemonstrativos(): Promise<string> {
  const contratoId = 'contrato-demo-lcm-593';

  // 1. Contrato
  const contratoDemo: Contrato = {
    id: contratoId,
    numeroContrato: 'SR-593/2020',
    processoSei: '50600.012345/2020-89',
    contratante: 'DNIT - Departamento Nacional de Infraestrutura de Transportes',
    superintendenciaRegional: 'SR-AC (Superintendência Regional no Estado do Acre)',
    unidadeLocal: 'UL Cruzeiro do Sul / Rio Branco',
    empresaExecutora: 'LCM Construção e Comércio S/A',
    cnpjExecutora: '19.789.456/0001-23',
    empresaSupervisora: 'Consórcio Supervisor Rodovias Amazônia',
    cnpjSupervisora: '24.123.789/0001-45',
    responsavelTecnicoExecutora: 'Eng. Ricardo Vasconcelos',
    emailResponsavelExecutora: 'ricardo.v@lcmconstrucao.com.br',
    artCreaExecutora: 'CREA 123456/D-AC (ART nº 2020/00451)',
    responsavelTecnicoSupervisora: 'Eng. Marcela Siqueira',
    emailResponsavelSupervisora: 'marcela.siqueira@supervisao.com.br',
    artCreaSupervisora: 'CREA 654321/D-AC (ART nº 2020/00987)',
    fiscalDnit: 'Eng. Eduardo Silva Sarmento',
    emailFiscalDnit: 'fiscal.sarmento@dnit.gov.br',
    portariaFiscal: 'Portaria DNIT nº 1.482/2020',

    nomeObra: 'Obras de Restauração, Melhoramento e Conservação Rodoviária',
    tipoEmpreendimento: 'Restauração e Manutenção Rodoviária',
    rodovia: 'BR-364',
    uf: 'AC',
    trecho: 'Entroncamento BR-317 (Rio Branco) - Sena Madureira - Feijó',
    subtrecho: 'km 250,000 ao km 300,000',
    segmentoInicialKm: 250.0,
    segmentoFinalKm: 300.0,
    extensaoContratualKm: 50.0,
    prazoContratualDias: 720,
    dataInicio: '2026-01-15',
    dataPrevisaoConclusao: '2028-01-05',
    observacoes: 'Contrato ativo com serviços prioritários de restauração de pista e revestimento primário.',
    ativo: true,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  await db.contratos.put(contratoDemo);

  // 2. Catálogo de serviços para esse contrato
  const servicosIds: Record<string, string> = {};
  for (const s of SERVICOS_PADRAO_DNIT) {
    const sId = `srv-${contratoId}-${s.nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    servicosIds[s.nome] = sId;
    await db.catalogoServicos.put({
      id: sId,
      contratoId: contratoId,
      ...s,
      ativo: true,
    });
  }

  // 3. RDO de referência: 30/09/2026
  const rdoDemo: Rdo = {
    id: 'rdo-demo-30-09-2026',
    contratoId: contratoId,
    numeroSequencial: 184,
    data: '2026-09-30',
    diaSemana: 'Quarta-feira',
    status: 'pronto_revisao',

    prazoContratualDias: 720,
    prazoDecorridoDias: 258,
    prazoAVencerDias: 462,

    climaManha: {
      condicaoTempo: 'Bom',
      condicaoTrabalho: 'Praticável',
      observacoes: 'Ensolarado, pista seca, sem precipitação pluviométrica.',
    },
    climaTarde: {
      condicaoTempo: 'Bom',
      condicaoTrabalho: 'Praticável',
      observacoes: 'Condições favoráveis para compactação e espalhamento.',
    },
    ocorrenciasMeteorologicas: 'Nenhuma ocorrência meteorológica desfavorável registrada no período.',

    apontador: 'Otávio Júnior',
    encarregado: 'Deocleciano Gonçalves',
    outrosResponsaveis: 'Técnico de Laboratório: Marcelo Brandão',
    maoDeObra: [
      { id: 'mo-1', funcao: 'Encarregado Geral', quantidade: 1, categoria: 'indireta' },
      { id: 'mo-2', funcao: 'Apontador de Obra', quantidade: 1, categoria: 'indireta' },
      { id: 'mo-3', funcao: 'Operador de Motoniveladora', quantidade: 2, categoria: 'direta' },
      { id: 'mo-4', funcao: 'Operador de Rolo Compactador', quantidade: 2, categoria: 'direta' },
      { id: 'mo-5', funcao: 'Motorista de Caminhão Pipa', quantidade: 2, categoria: 'direta' },
      { id: 'mo-6', funcao: 'Motorista de Caminhão Basculante', quantidade: 6, categoria: 'direta' },
      { id: 'mo-7', funcao: 'Rasteleiro / Servente de Pista', quantidade: 8, categoria: 'direta' },
      { id: 'mo-8', funcao: 'Laboratorista de Solos', quantidade: 1, categoria: 'indireta' },
    ],

    equipamentos: [
      { id: 'eq-1', descricao: 'Motoniveladora Caterpillar 140K', quantidade: 2, placaPatrimonio: 'PAT-401 / PAT-402', situacao: 'operacional' },
      { id: 'eq-2', descricao: 'Rolo Compactador Vibratório Dynapac CA250', quantidade: 2, placaPatrimonio: 'PAT-501 / PAT-502', situacao: 'operacional' },
      { id: 'eq-3', descricao: 'Caminhão Tanque Pipa 15.000 L', quantidade: 2, placaPatrimonio: 'MZX-8890 / NAF-4412', situacao: 'operacional' },
      { id: 'eq-4', descricao: 'Caminhão Basculante Traçado 14 m³', quantidade: 6, placaPatrimonio: 'Frota LCM', situacao: 'operacional' },
      { id: 'eq-5', descricao: 'Pá Carregadeira Hyundai HL760', quantidade: 1, placaPatrimonio: 'PAT-108', situacao: 'operacional' },
    ],

    servicosExecutados: [
      {
        id: 'se-1',
        servicoCatalogoId: servicosIds['Regularização de Subleito'],
        nomeServico: 'Regularização de Subleito',
        grupoServico: 'Implantação',
        descricaoAtividade: 'Conformação e escarificação do subleito com motoniveladora, homogeneização com umedecimento e compactação com rolo vibratório.',
        rodovia: 'BR-364',
        uf: 'AC',
        estacaInicial: '13630',
        estacaFinal: '13655',
        kmInicial: 272.6,
        kmFinal: 273.1,
        extensaoCalculadaMetros: 500.0,
        extensaoInformadaMetros: 500.0,
        extensaoDivergente: false,
        larguraMetros: 9.0,
        espessuraMetros: 0.2,
        areaCalculadaM2: 4500.0,
        volumeCalculadoM3: 900.0,
        unidadeMedicao: 'm²',
        situacao: 'Concluido',
        observacoes: 'Segmento concluído com liberação topográfica e ensaios laboratoriais satisfatórios.',
      },
      {
        id: 'se-2',
        servicoCatalogoId: servicosIds['Revestimento Primário 02'],
        nomeServico: 'Revestimento Primário 02',
        grupoServico: 'Pavimentação — pista e acostamento',
        descricaoAtividade: 'Transporte de jazida licenciada, descarga controlada, espalhamento mecânico, umedecimento e rolagem de revestimento primário.',
        rodovia: 'BR-364',
        uf: 'AC',
        estacaInicial: '13630',
        estacaFinal: '13655',
        kmInicial: 272.6,
        kmFinal: 273.1,
        extensaoCalculadaMetros: 500.0,
        extensaoInformadaMetros: 500.0,
        extensaoDivergente: false,
        larguraMetros: 8.0,
        espessuraMetros: 0.15,
        areaCalculadaM2: 4000.0,
        volumeCalculadoM3: 600.0,
        unidadeMedicao: 'm²',
        situacao: 'Concluido',
        observacoes: 'Material com umidade ótima de compactação, atingido grau de compactação superior a 100% do Proctor Normal.',
      },
    ],

    semRestricoes: true,
    restricoesCategorias: {
      'Pessoal': false,
      'Equipamentos': false,
      'Instalações': false,
      'Cronograma físico': false,
      'Qualidade': false,
      'Atendimento à fiscalização': false,
      'Administração da obra': false,
      'Meio ambiente': false,
    },
    eventosRestricoes: [],

    comentarios: [
      {
        id: 'com-1',
        origem: 'Construtora',
        autor: 'Eng. Ricardo Vasconcelos',
        dataHora: '2026-09-30 17:30',
        tipo: 'Registro de atividade',
        texto: 'Os serviços de regularização de subleito e aplicação de revestimento primário 02 no trecho km 272,600 ao km 273,100 foram concluídos conforme as especificações técnicas da Norma DNIT 107/2009-ES e do projeto executivo.',
      },
      {
        id: 'com-2',
        origem: 'Supervisora',
        autor: 'Eng. Marcela Siqueira',
        dataHora: '2026-09-30 18:00',
        tipo: 'Observação técnica',
        texto: 'Acompanhamento contínuo dos ensaios de densidade in situ (frasco de areia) e verificação do greide de conformação final. Atividades desenvolvidas com bom ritmo e sinalização provisória adequada.',
      },
    ],

    ordensServico: [
      {
        id: 'os-1',
        numero: 'OS nº 042/2026-DNIT',
        segmento: 'km 272,000 ao km 275,000',
        naturezaServico: 'Recomposição e restauração de pista de rolamento com revestimento primário',
        observacoes: 'Ordem de serviço regular e cumprida dentro do cronograma pactuado.',
      },
    ],

    consideracoesConstrutora: 'A Construtora informa que a jazida de cascalho no km 268 opera regularmente com licença ambiental válida e acesso em bom estado. Cronograma cumprido rigorosamente no período.',
    consideracoesSupervisora: 'A Supervisora atesta o cumprimento satisfatório dos procedimentos de execução, suficiência de equipamentos operacionais e observância das normas de segurança do tráfego.',
    consideracoesFiscalizacao: 'A Fiscalização do DNIT toma ciência dos registros diários e valida os lançamentos apresentados, com ressalva para manutenção constante da rega com caminhão pipa no trecho transitável.',

    fotografias: [
      {
        id: 'ft-1',
        fotoUrl: '', // Será gerado se necessário ou mantido leve
        descricao: 'Visão geral da compactação de revestimento primário',
        servicoRelacionado: 'Revestimento Primário 02',
        segmento: 'km 272,600 ao km 273,100',
        latitude: -9.071234,
        longitude: -70.324567,
        dataCaptura: '2026-09-30 15:45',
        dataExecucao: '2026-09-30',
        legenda: 'Foto 01 — Operação do rolo compactador vibratório Dynapac CA250 sobre camada de cascalho no km 272,850.',
      },
    ],

    identificacaoResponsaveis: {
      executora: {
        nome: 'Eng. Ricardo Vasconcelos',
        cargo: 'Engenheiro Residente (LCM Construção)',
        email: 'ricardo.v@lcmconstrucao.com.br',
        artCrea: 'CREA 123456/D-AC',
      },
      supervisora: {
        nome: 'Eng. Marcela Siqueira',
        cargo: 'Engenheira Fiscal de Supervisão',
        email: 'marcela.siqueira@supervisao.com.br',
        artCrea: 'CREA 654321/D-AC',
      },
      fiscalizacaoDnit: {
        nome: 'Eng. Eduardo Silva Sarmento',
        cargo: 'Fiscal do Contrato - DNIT/SR-AC',
        email: 'fiscal.sarmento@dnit.gov.br',
        portaria: 'Portaria nº 1.482/2020',
      },
    },

    criadoEm: '2026-09-30T18:30:00.000Z',
    atualizadoEm: '2026-09-30T18:45:00.000Z',
  };

  await db.rdos.put(rdoDemo);

  return contratoId;
}

/**
 * Exporta backup completo do IndexedDB em formato JSON padronizado.
 */
export async function exportarBackupCompleto(): Promise<string> {
  const [contratos, catalogoServicos, rdos, equipes, equipamentos] = await Promise.all([
    db.contratos.toArray(),
    db.catalogoServicos.toArray(),
    db.rdos.toArray(),
    db.equipesPredefinidas.toArray(),
    db.equipamentosPredefinidos.toArray(),
  ]);

  const backupData = {
    versao: '1.0.0',
    geradoEm: new Date().toISOString(),
    origem: 'RDO Digital — Diário de Obra DNIT (Norma 097/2025 – PRO)',
    dados: {
      contratos,
      catalogoServicos,
      rdos,
      equipesPredefinidas: equipes,
      equipamentosPredefinidos: equipamentos,
    },
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Restaura o backup a partir de JSON com validação de estrutura.
 */
export async function restaurarBackupCompleto(conteudoJson: string): Promise<{
  contratos: number;
  servicos: number;
  rdos: number;
}> {
  let objeto: any;
  try {
    objeto = JSON.parse(conteudoJson);
  } catch {
    throw new Error('Arquivo de backup inválido: não é um JSON válido.');
  }

  const dados = objeto.dados || objeto;
  if (!dados || (!dados.contratos && !dados.rdos)) {
    throw new Error('Formato de backup incompatível ou sem tabelas válidas de RDO/Contratos.');
  }

  return await db.transaction('rw', [db.contratos, db.catalogoServicos, db.rdos, db.equipesPredefinidas, db.equipamentosPredefinidos], async () => {
    let countContratos = 0;
    let countServicos = 0;
    let countRdos = 0;

    if (Array.isArray(dados.contratos)) {
      for (const item of dados.contratos) {
        if (item.id && item.numeroContrato) {
          await db.contratos.put(item);
          countContratos++;
        }
      }
    }

    if (Array.isArray(dados.catalogoServicos)) {
      for (const item of dados.catalogoServicos) {
        if (item.id && item.nome) {
          await db.catalogoServicos.put(item);
          countServicos++;
        }
      }
    }

    if (Array.isArray(dados.rdos)) {
      for (const item of dados.rdos) {
        if (item.id && item.contratoId) {
          await db.rdos.put(item);
          countRdos++;
        }
      }
    }

    if (Array.isArray(dados.equipesPredefinidas)) {
      for (const item of dados.equipesPredefinidas) {
        await db.equipesPredefinidas.put(item);
      }
    }

    if (Array.isArray(dados.equipamentosPredefinidos)) {
      for (const item of dados.equipamentosPredefinidos) {
        await db.equipamentosPredefinidos.put(item);
      }
    }

    return { contratos: countContratos, servicos: countServicos, rdos: countRdos };
  });
}

/**
 * Limpa todos os dados armazenados localmente no IndexedDB.
 */
export async function limparTodosOsDados(): Promise<void> {
  await db.transaction('rw', [db.contratos, db.catalogoServicos, db.rdos, db.equipesPredefinidas, db.equipamentosPredefinidos], async () => {
    await db.contratos.clear();
    await db.catalogoServicos.clear();
    await db.rdos.clear();
    await db.equipesPredefinidas.clear();
    await db.equipamentosPredefinidos.clear();
  });
}
