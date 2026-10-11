export type GrupoServico = 
  | 'Implantação'
  | 'Pavimentação — pista e acostamento'
  | 'Drenagem e obras de arte'
  | 'Obras complementares'
  | 'Outros serviços';

export type UnidadeMedicao = 'm' | 'm²' | 'm³' | 'km' | 'un' | 't' | 'kg' | 'h';

export type StatusRdo = 'em_elaboracao' | 'pronto_revisao' | 'finalizado' | 'arquivado';

export type CondicaoMeteorologica = 'Bom' | 'Nublado' | 'Chuva leve' | 'Chuva intensa' | 'Instável' | 'Outro';
export type CondicaoTrabalho = 'Praticável' | 'Impraticável';

export type SituacaoEquipamento = 'operacional' | 'parcialmente_operacional' | 'indisponivel';

export type SituacaoServico = 
  | 'Nao_iniciado'
  | 'Em_execucao'
  | 'Parcialmente_executado'
  | 'Concluido'
  | 'Interrompido';

export type CategoriaRestricao = 
  | 'Pessoal'
  | 'Equipamentos'
  | 'Instalações'
  | 'Cronograma físico'
  | 'Qualidade'
  | 'Atendimento à fiscalização'
  | 'Administração da obra'
  | 'Meio ambiente';

export type SituacaoOcorrencia = 'aberto' | 'em_tratamento' | 'resolvido';

export type OrigemComentario = 'Construtora' | 'Supervisora' | 'Fiscalização DNIT';

export type TipoComentario = 
  | 'Registro de atividade'
  | 'Observação técnica'
  | 'Ocorrência'
  | 'Não conformidade'
  | 'Solicitação de providência'
  | 'Resposta ou esclarecimento'
  | 'Determinação da fiscalização'
  | 'Outros';

export interface Contrato {
  id: string;
  // Identificação do contrato
  numeroContrato: string; // Ex: SR-593/2020
  processoSei?: string;
  contratante: string; // DNIT
  superintendenciaRegional: string; // Ex: SR-AC / SR-RO
  unidadeLocal: string; // Ex: UL Rio Branco
  empresaExecutora: string; // Ex: LCM Construção e Comércio S/A
  cnpjExecutora?: string;
  empresaSupervisora?: string;
  cnpjSupervisora?: string;
  responsavelTecnicoExecutora: string;
  emailResponsavelExecutora?: string;
  artCreaExecutora?: string;
  responsavelTecnicoSupervisora?: string;
  emailResponsavelSupervisora?: string;
  artCreaSupervisora?: string;
  fiscalDnit: string;
  emailFiscalDnit?: string;
  portariaFiscal?: string;

  // Dados do empreendimento
  nomeObra: string; // Ex: Restauração e Manutenção Rodoviária
  tipoEmpreendimento: string; // Ex: Restauração / Conservação / Construção
  rodovia: string; // Ex: BR-364
  uf: string; // Ex: AC
  trecho?: string;
  subtrecho?: string;
  segmentoInicialKm: number; // Ex: 250.000
  segmentoFinalKm: number; // Ex: 300.000
  extensaoContratualKm: number; // Ex: 50.000
  prazoContratualDias: number; // Ex: 720
  dataInicio: string; // YYYY-MM-DD
  dataPrevisaoConclusao: string; // YYYY-MM-DD
  observacoes?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CatalogoServico {
  id: string;
  contratoId: string;
  nome: string; // Ex: Regularização de Subleito
  grupo: GrupoServico;
  codigoReferencia?: string;
  unidade: UnidadeMedicao;
  descricaoPadrao?: string;
  observacoesTecnicas?: string;
  larguraPadrao?: number;
  espessuraPadrao?: number;
  ativo: boolean;
}

export interface MaoDeObraItem {
  id: string;
  funcao: string;
  quantidade: number;
  categoria: 'direta' | 'indireta';
  observacoes?: string;
}

export interface EquipamentoItem {
  id: string;
  descricao: string;
  quantidade: number;
  placaPatrimonio?: string;
  situacao: SituacaoEquipamento;
  observacoes?: string;
}

export interface ServicoExecutadoItem {
  id: string;
  servicoCatalogoId?: string;
  nomeServico: string;
  grupoServico: GrupoServico | string;
  descricaoAtividade: string;
  rodovia: string;
  uf: string;
  estacaInicial?: string;
  estacaFinal?: string;
  kmInicial: number;
  kmFinal: number;
  extensaoCalculadaMetros: number; // (kmFinal - kmInicial) * 1000
  extensaoInformadaMetros: number;
  extensaoDivergente: boolean;
  larguraMetros?: number;
  espessuraMetros?: number;
  areaCalculadaM2?: number; // extensão * largura
  volumeCalculadoM3?: number; // extensão * largura * espessura
  unidadeMedicao: string;
  situacao: SituacaoServico;
  observacoes?: string;
}

export interface EventoRestricaoItem {
  id: string;
  categoria: CategoriaRestricao;
  descricao: string;
  dataHora: string;
  segmento?: string;
  responsavel: string;
  providencia: string;
  prazoSolucao?: string;
  situacao: SituacaoOcorrencia;
  observacoes?: string;
}

export interface ComentarioItem {
  id: string;
  origem: OrigemComentario;
  autor: string;
  dataHora: string;
  tipo: TipoComentario;
  texto: string;
}

export interface OrdemServicoItem {
  id: string;
  numero: string;
  segmento: string;
  naturezaServico: string;
  observacoes?: string;
}

export interface FotoItem {
  id: string;
  fotoUrl: string; // Data URL em base64 comprimida
  descricao: string;
  servicoRelacionado?: string;
  segmento: string;
  latitude?: number;
  longitude?: number;
  dataCaptura: string; // YYYY-MM-DD HH:mm
  dataExecucao: string; // YYYY-MM-DD
  legenda: string;
  autorizacao?: string;
}

export interface RdoClimaPeriodo {
  condicaoTempo: CondicaoMeteorologica;
  condicaoTrabalho: CondicaoTrabalho;
  observacoes?: string;
}

export interface Rdo {
  id: string;
  contratoId: string;
  numeroSequencial: number; // Sequencial único por contrato
  data: string; // YYYY-MM-DD
  diaSemana: string; // Segunda-feira, etc.
  status: StatusRdo;

  // Prazos calculados
  prazoContratualDias: number;
  prazoDecorridoDias: number;
  prazoAVencerDias: number;

  // Etapa 2: Clima
  climaManha: RdoClimaPeriodo;
  climaTarde: RdoClimaPeriodo;
  ocorrenciasMeteorologicas?: string;

  // Etapa 3: Mão de Obra
  apontador: string;
  encarregado: string;
  outrosResponsaveis?: string;
  maoDeObra: MaoDeObraItem[];

  // Etapa 4: Equipamentos
  equipamentos: EquipamentoItem[];

  // Etapa 5: Serviços Executados
  servicosExecutados: ServicoExecutadoItem[];

  // Etapa 6: Eventos com Restrições
  semRestricoes: boolean;
  restricoesCategorias: Record<CategoriaRestricao, boolean>;
  eventosRestricoes: EventoRestricaoItem[];

  // Etapa 7: Comentários e Ordens de Serviço
  comentarios: ComentarioItem[];
  ordensServico: OrdemServicoItem[];

  // Etapa 8: Considerações das Partes
  consideracoesConstrutora: string;
  consideracoesSupervisora: string;
  consideracoesFiscalizacao: string;

  // Etapa 9: Fotografias
  fotografias: FotoItem[];

  // Responsáveis e assinatura
  identificacaoResponsaveis: {
    executora: {
      nome: string;
      cargo: string;
      email: string;
      artCrea?: string;
    };
    supervisora: {
      nome: string;
      cargo: string;
      email: string;
      artCrea?: string;
    };
    fiscalizacaoDnit: {
      nome: string;
      cargo: string;
      email: string;
      portaria?: string;
    };
  };

  criadoEm: string;
  atualizadoEm: string;
}

export interface EquipePredefinida {
  id: string;
  nome: string; // Ex: Equipe Padrão Terraplenagem
  contratoId?: string;
  apontador: string;
  encarregado: string;
  itens: MaoDeObraItem[];
}

export interface EquipamentoPredefinido {
  id: string;
  descricao: string;
  placaPatrimonio?: string;
  quantidadePadrao: number;
}
