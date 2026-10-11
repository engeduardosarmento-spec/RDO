import * as XLSX from 'xlsx';
import type { Rdo, Contrato } from '../types';
import { formatarDataBR, formatarKm } from './calculations';

export function gerarExcelRdoDnit(rdo: Rdo, contrato?: Contrato): void {
  const wb = XLSX.utils.book_new();
  const dataFormatada = formatarDataBR(rdo.data);
  const numeroContrato = contrato?.numeroContrato || 'Não informado';

  // ----------------------------------------------------
  // PLANILHA 1: RDO - Identificação Geral
  // ----------------------------------------------------
  const rdoInfo = [
    ['REGISTRO DE DIÁRIO DE OBRA — DNIT (NORMA 097/2025 – PRO)'],
    [],
    ['DADOS DO REGISTRO'],
    ['Número do RDO', rdo.numeroSequencial],
    ['Data do Relatório', dataFormatada],
    ['Dia da Semana', rdo.diaSemana || ''],
    ['Status Interno', rdo.status.toUpperCase()],
    [],
    ['DADOS DO CONTRATO E EMPREENDIMENTO'],
    ['Contrato DNIT', numeroContrato],
    ['Processo SEI', contrato?.processoSei || ''],
    ['Contratante', contrato?.contratante || 'DNIT'],
    ['Superintendência Regional', contrato?.superintendenciaRegional || ''],
    ['Unidade Local', contrato?.unidadeLocal || ''],
    ['Empresa Executora', contrato?.empresaExecutora || ''],
    ['CNPJ Executora', contrato?.cnpjExecutora || ''],
    ['Empresa Supervisora', contrato?.empresaSupervisora || ''],
    ['CNPJ Supervisora', contrato?.cnpjSupervisora || ''],
    ['Obra / Empreendimento', contrato?.nomeObra || ''],
    ['Tipo de Empreendimento', contrato?.tipoEmpreendimento || ''],
    ['Rodovia / UF', `${contrato?.rodovia || ''}/${contrato?.uf || ''}`],
    ['Trecho / Subtrecho', `${contrato?.trecho || ''} - ${contrato?.subtrecho || ''}`],
    ['Segmento Contratual', `${formatarKm(contrato?.segmentoInicialKm)} ao ${formatarKm(contrato?.segmentoFinalKm)}`],
    ['Extensão Contratual (km)', contrato?.extensaoContratualKm || ''],
    [],
    ['PRAZOS CONTRATUAIS (DIAS)'],
    ['Prazo Contratual Total', rdo.prazoContratualDias],
    ['Prazo Decorrido', rdo.prazoDecorridoDias],
    ['Prazo a Vencer', rdo.prazoAVencerDias],
    ['Data Início da Obra', formatarDataBR(contrato?.dataInicio)],
    ['Data Previsão de Conclusão', formatarDataBR(contrato?.dataPrevisaoConclusao)],
    [],
    ['CONDIÇÕES CLIMÁTICAS'],
    ['Manhã - Tempo', rdo.climaManha.condicaoTempo],
    ['Manhã - Condição de Trabalho', rdo.climaManha.condicaoTrabalho],
    ['Manhã - Observações', rdo.climaManha.observacoes || ''],
    ['Tarde - Tempo', rdo.climaTarde.condicaoTempo],
    ['Tarde - Condição de Trabalho', rdo.climaTarde.condicaoTrabalho],
    ['Tarde - Observações', rdo.climaTarde.observacoes || ''],
    ['Ocorrências Meteorológicas', rdo.ocorrenciasMeteorologicas || ''],
    [],
    ['CONSIDERAÇÕES FORMAIS DAS PARTES'],
    ['Construtora', rdo.consideracoesConstrutora || 'Sem observações.'],
    ['Supervisora', rdo.consideracoesSupervisora || 'Sem observações.'],
    ['Fiscalização DNIT', rdo.consideracoesFiscalizacao || 'Sem observações.'],
  ];

  const wsRdo = XLSX.utils.aoa_to_sheet(rdoInfo);
  wsRdo['!cols'] = [{ wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsRdo, 'RDO');

  // ----------------------------------------------------
  // PLANILHA 2: SERVIÇOS EXECUTADOS
  // ----------------------------------------------------
  const headersServicos = [
    'Item',
    'Data',
    'Contrato',
    'Grupo de Serviço',
    'Serviço',
    'Descrição da Atividade',
    'Rodovia/UF',
    'Estaca Inicial',
    'Estaca Final',
    'Km Inicial',
    'Km Final',
    'Extensão Calculada (m)',
    'Extensão Informada (m)',
    'Divergência Extensão?',
    'Largura (m)',
    'Espessura (m)',
    'Área Estimada (m²)',
    'Volume Estimado (m³)',
    'Unidade',
    'Situação',
    'Observações Complementares',
  ];

  const rowsServicos = rdo.servicosExecutados.map((s, idx) => [
    idx + 1,
    dataFormatada,
    numeroContrato,
    s.grupoServico,
    s.nomeServico,
    s.descricaoAtividade,
    `${s.rodovia}/${s.uf}`,
    s.estacaInicial || '-',
    s.estacaFinal || '-',
    s.kmInicial,
    s.kmFinal,
    s.extensaoCalculadaMetros,
    s.extensaoInformadaMetros || s.extensaoCalculadaMetros,
    s.extensaoDivergente ? 'SIM' : 'NÃO',
    s.larguraMetros || '',
    s.espessuraMetros || '',
    s.areaCalculadaM2 || '',
    s.volumeCalculadoM3 || '',
    s.unidadeMedicao,
    s.situacao.replace('_', ' '),
    s.observacoes || '',
  ]);

  const wsServicos = XLSX.utils.aoa_to_sheet([headersServicos, ...rowsServicos]);
  wsServicos['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 16 },
    { wch: 25 },
    { wch: 30 },
    { wch: 45 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 10 },
    { wch: 18 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsServicos, 'Serviços Executados');

  // ----------------------------------------------------
  // PLANILHA 3: EQUIPE E EQUIPAMENTOS
  // ----------------------------------------------------
  const rowsEquipe = [
    ['MÃO DE OBRA E EFETIVO DE CAMPO'],
    ['Apontador de Obra', rdo.apontador || 'Não informado'],
    ['Encarregado Geral', rdo.encarregado || 'Não informado'],
    ['Outros Responsáveis', rdo.outrosResponsaveis || 'Não informado'],
    [],
    ['Função / Cargo', 'Quantidade', 'Categoria', 'Observações'],
    ...rdo.maoDeObra.map((m) => [m.funcao, m.quantidade, m.categoria.toUpperCase(), m.observacoes || '']),
    [],
    ['TOTAIS DE MÃO DE OBRA'],
    ['Total Mão de Obra Direta', rdo.maoDeObra.filter((m) => m.categoria === 'direta').reduce((a, b) => a + b.quantidade, 0)],
    ['Total Mão de Obra Indireta', rdo.maoDeObra.filter((m) => m.categoria === 'indireta').reduce((a, b) => a + b.quantidade, 0)],
    ['Total Geral de Efetivo', rdo.maoDeObra.reduce((a, b) => a + b.quantidade, 0)],
    [],
    ['EQUIPAMENTOS E VEÍCULOS'],
    ['Equipamento / Descrição', 'Quantidade', 'Placa / Patrimônio', 'Situação Operacional', 'Observações'],
    ...rdo.equipamentos.map((e) => [
      e.descricao,
      e.quantidade,
      e.placaPatrimonio || '',
      e.situacao.toUpperCase(),
      e.observacoes || '',
    ]),
    [],
    ['TOTAIS DE EQUIPAMENTOS'],
    ['Total Geral de Equipamentos', rdo.equipamentos.reduce((a, b) => a + b.quantidade, 0)],
    ['Total Operacionais', rdo.equipamentos.filter((e) => e.situacao === 'operacional').reduce((a, b) => a + b.quantidade, 0)],
  ];

  const wsEquipe = XLSX.utils.aoa_to_sheet(rowsEquipe);
  wsEquipe['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 22 }, { wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsEquipe, 'Equipe e Equipamentos');

  // ----------------------------------------------------
  // PLANILHA 4: OCORRÊNCIAS E COMENTÁRIOS
  // ----------------------------------------------------
  const rowsOcorrencias = [
    ['EVENTOS COM RESTRIÇÕES (NORMA DNIT 097/2025 - ANEXO A)'],
    ['Declaração', rdo.semRestricoes ? 'Sem restrições no período' : 'Com restrições apontadas'],
    [],
    ['CATEGORIAS AVALIADAS (RESTRIÇÃO "R")'],
    ...Object.entries(rdo.restricoesCategorias || {}).map(([cat, ativa]) => [cat, ativa ? 'R (Restrição ativa)' : 'Sem restrição']),
    [],
    ['DETALHAMENTO DAS RESTRIÇÕES'],
    ['Item', 'Categoria', 'Descrição da Ocorrência', 'Data/Hora', 'Segmento', 'Responsável', 'Providência Adotada', 'Prazo Solução', 'Situação'],
    ...rdo.eventosRestricoes.map((ev, i) => [
      i + 1,
      ev.categoria,
      ev.descricao,
      ev.dataHora,
      ev.segmento || '-',
      ev.responsavel,
      ev.providencia,
      ev.prazoSolucao || '-',
      ev.situacao.toUpperCase(),
    ]),
    [],
    ['COMENTÁRIOS DAS PARTES'],
    ['Origem', 'Autor', 'Data/Hora', 'Tipo de Comentário', 'Texto do Comentário'],
    ...rdo.comentarios.map((c) => [c.origem, c.autor, c.dataHora, c.tipo, c.texto]),
    [],
    ['ORDENS DE SERVIÇO VINCULADAS (FISCALIZAÇÃO DNIT)'],
    ['Número da OS', 'Segmento', 'Natureza do Serviço', 'Observações'],
    ...rdo.ordensServico.map((os) => [os.numero, os.segmento, os.naturezaServico, os.observacoes || '']),
  ];

  const wsOcorrencias = XLSX.utils.aoa_to_sheet(rowsOcorrencias);
  wsOcorrencias['!cols'] = [
    { wch: 25 },
    { wch: 25 },
    { wch: 40 },
    { wch: 18 },
    { wch: 20 },
    { wch: 22 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, wsOcorrencias, 'Ocorrências e Comentários');

  // ----------------------------------------------------
  // PLANILHA 5: FOTOGRAFIAS E METADADOS
  // ----------------------------------------------------
  const headersFotos = [
    'Item',
    'Descrição',
    'Serviço Relacionado',
    'Segmento',
    'Latitude',
    'Longitude',
    'Data Captura',
    'Data Execução',
    'Legenda Complementar',
  ];

  const rowsFotos = rdo.fotografias.map((f, i) => [
    i + 1,
    f.descricao,
    f.servicoRelacionado || '-',
    f.segmento || '-',
    f.latitude || 'Não informada',
    f.longitude || 'Não informada',
    f.dataCaptura || '-',
    f.dataExecucao || '-',
    f.legenda || '-',
  ]);

  const wsFotos = XLSX.utils.aoa_to_sheet([
    ['EVIDÊNCIAS FOTOGRÁFICAS E METADADOS (NORMA DNIT 097/2025)'],
    ['Nota:', 'Metadados gerados pelo aplicativo não substituem a comprovação formal de autenticidade.'],
    [],
    headersFotos,
    ...rowsFotos,
  ]);
  wsFotos['!cols'] = [
    { wch: 6 },
    { wch: 35 },
    { wch: 25 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 18 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsFotos, 'Fotografias');

  // Salvar arquivo .xlsx
  const nomeArquivo = `RDO_${rdo.numeroSequencial.toString().padStart(4, '0')}_${rdo.data}_${numeroContrato.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, nomeArquivo);
}
