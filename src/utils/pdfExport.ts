import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Rdo, Contrato, CategoriaRestricao } from '../types';
import {
  formatarDataBR,
  formatarKm,
  formatarMetros,
  formatarArea,
  formatarVolume,
} from './calculations';

export async function gerarPdfRdoDnit(rdo: Rdo, contrato?: Contrato): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const dataFormatada = formatarDataBR(rdo.data);
  const numeroContrato = contrato?.numeroContrato || 'Não informado';

  // Cabeçalho Oficial DNIT (Anexo A)
  doc.setFillColor(11, 59, 96); // Azul Institucional DNIT #0B3B60
  doc.rect(margin, 12, pageWidth - margin * 2, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DEPARTAMENTO NACIONAL DE INFRAESTRUTURA DE TRANSPORTES — DNIT', pageWidth / 2, 19, {
    align: 'center',
  });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('REGISTRO DE DIÁRIO DE OBRA — RDO (NORMA DNIT 097/2025 – PRO — ANEXO A)', pageWidth / 2, 25, {
    align: 'center',
  });

  // Título e identificação inicial
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`RDO Nº: ${rdo.numeroSequencial.toString().padStart(4, '0')}`, margin, 36);
  doc.text(`DATA: ${dataFormatada} (${rdo.diaSemana || ''})`, pageWidth / 2 - 20, 36);
  doc.text(`STATUS: ${rdo.status.toUpperCase().replace('_', ' ')}`, pageWidth - margin, 36, {
    align: 'right',
  });

  let currentY = 40;

  // 1. Identificação do Contrato e da Obra
  const infoContrato = [
    [
      { content: 'CONTRATO:', styles: { fontStyle: 'bold', cellWidth: 32 } },
      { content: contrato?.numeroContrato || 'Não informado', styles: { cellWidth: 60 } },
      { content: 'PROCESSO SEI:', styles: { fontStyle: 'bold', cellWidth: 32 } },
      { content: contrato?.processoSei || 'Não informado' },
    ],
    [
      { content: 'SUPERINTENDÊNCIA:', styles: { fontStyle: 'bold' } },
      { content: contrato?.superintendenciaRegional || 'Não informada' },
      { content: 'UNIDADE LOCAL:', styles: { fontStyle: 'bold' } },
      { content: contrato?.unidadeLocal || 'Não informada' },
    ],
    [
      { content: 'EXECUTORA:', styles: { fontStyle: 'bold' } },
      { content: contrato?.empresaExecutora || 'Não informada' },
      { content: 'SUPERVISORA:', styles: { fontStyle: 'bold' } },
      { content: contrato?.empresaSupervisora || 'Não informada' },
    ],
    [
      { content: 'OBRA / EMPREEND.:', styles: { fontStyle: 'bold' } },
      { content: `${contrato?.nomeObra || ''} (${contrato?.tipoEmpreendimento || ''})`, colSpan: 3 },
    ],
    [
      { content: 'LOCALIZAÇÃO:', styles: { fontStyle: 'bold' } },
      {
        content: `${contrato?.rodovia || ''}/${contrato?.uf || ''} — Trecho: ${contrato?.trecho || '-'} | Subtrecho: ${contrato?.subtrecho || '-'}`,
        colSpan: 3,
      },
    ],
    [
      { content: 'SEGMENTO TOTAL:', styles: { fontStyle: 'bold' } },
      {
        content: `${formatarKm(contrato?.segmentoInicialKm)} ao ${formatarKm(contrato?.segmentoFinalKm)} (Extensão: ${contrato?.extensaoContratualKm ? contrato.extensaoContratualKm.toFixed(3) + ' km' : '-'})`,
        colSpan: 3,
      },
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    body: infoContrato as any,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 2. Prazo Contratual
  const prazosData = [
    [
      { content: 'Prazo Contratual Total', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: 'Prazo Decorrido no Período', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: 'Prazo a Vencer', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: 'Início Contratual / Término Previsto', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
    ],
    [
      `${rdo.prazoContratualDias} dias`,
      `${rdo.prazoDecorridoDias} dias`,
      `${rdo.prazoAVencerDias} dias`,
      `${formatarDataBR(contrato?.dataInicio)} a ${formatarDataBR(contrato?.dataPrevisaoConclusao)}`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [prazosData[0] as any],
    body: [prazosData[1] as any],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, halign: 'center', textColor: [30, 41, 59] },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 3. Condições Climáticas (Manhã e Tarde)
  const climaData = [
    [
      { content: 'Período', styles: { fontStyle: 'bold', halign: 'center', fillColor: [226, 232, 240] } },
      { content: 'Condição Meteorológica', styles: { fontStyle: 'bold', halign: 'center', fillColor: [226, 232, 240] } },
      { content: 'Condição de Trabalho', styles: { fontStyle: 'bold', halign: 'center', fillColor: [226, 232, 240] } },
      { content: 'Observações do Tempo', styles: { fontStyle: 'bold', fillColor: [226, 232, 240] } },
    ],
    [
      'MANHÃ',
      rdo.climaManha.condicaoTempo,
      rdo.climaManha.condicaoTrabalho,
      rdo.climaManha.observacoes || 'Sem observações complementares.',
    ],
    [
      'TARDE',
      rdo.climaTarde.condicaoTempo,
      rdo.climaTarde.condicaoTrabalho,
      rdo.climaTarde.observacoes || 'Sem observações complementares.',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [climaData[0] as any],
    body: climaData.slice(1) as any,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 4. Mão de Obra e Equipamentos
  const direta = rdo.maoDeObra.filter((m) => m.categoria === 'direta');
  const indireta = rdo.maoDeObra.filter((m) => m.categoria === 'indireta');
  const totalDireta = direta.reduce((a, b) => a + (b.quantidade || 0), 0);
  const totalIndireta = indireta.reduce((a, b) => a + (b.quantidade || 0), 0);

  const maoObraTexto = [
    `APONTADOR: ${rdo.apontador || 'Não informado'} | ENCARREGADO: ${rdo.encarregado || 'Não informado'}`,
    `DIRETA (${totalDireta} pessoas): ` +
      (direta.map((d) => `${d.quantidade}x ${d.funcao}`).join(', ') || 'Nenhum lançamento.'),
    `INDIRETA (${totalIndireta} pessoas): ` +
      (indireta.map((d) => `${d.quantidade}x ${d.funcao}`).join(', ') || 'Nenhum lançamento.'),
  ].join('\n');

  const totalEq = rdo.equipamentos.reduce((a, b) => a + (b.quantidade || 0), 0);
  const opEq = rdo.equipamentos.filter((e) => e.situacao === 'operacional').reduce((a, b) => a + (b.quantidade || 0), 0);
  const equipTexto = [
    `TOTAL EQUIPAMENTOS: ${totalEq} (${opEq} operacionais)`,
    rdo.equipamentos.length > 0
      ? rdo.equipamentos
          .map(
            (e) =>
              `• ${e.quantidade}x ${e.descricao}${e.placaPatrimonio ? ` (${e.placaPatrimonio})` : ''} [${e.situacao}]`
          )
          .join('\n')
      : 'Nenhum equipamento registrado.',
  ].join('\n');

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        { content: 'MÃO DE OBRA ATIVA', styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] } },
        { content: 'EQUIPAMENTOS E VEÍCULOS', styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] } },
      ],
    ],
    body: [[maoObraTexto, equipTexto]],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 5. Serviços Desenvolvidos no Período
  const servicosHeader = [
    '#',
    'Serviço / Grupo',
    'Segmento / Estacas',
    'Ext. (m)',
    'Larg. (m)',
    'Esp. (m)',
    'Área (m²)',
    'Vol. (m³)',
    'Situação',
    'Descrição da Atividade',
  ];

  const servicosRows =
    rdo.servicosExecutados.length > 0
      ? rdo.servicosExecutados.map((s, idx) => [
          idx + 1,
          `${s.nomeServico}\n[${s.grupoServico}]`,
          `${formatarKm(s.kmInicial)} ao\n${formatarKm(s.kmFinal)}${s.estacaInicial ? `\nEst. ${s.estacaInicial}-${s.estacaFinal}` : ''}`,
          formatarMetros(s.extensaoInformadaMetros || s.extensaoCalculadaMetros),
          s.larguraMetros ? formatarMetros(s.larguraMetros) : '-',
          s.espessuraMetros ? formatarMetros(s.espessuraMetros) : '-',
          s.areaCalculadaM2 ? formatarArea(s.areaCalculadaM2) : '-',
          s.volumeCalculadoM3 ? formatarVolume(s.volumeCalculadoM3) : '-',
          s.situacao.replace('_', ' '),
          s.descricaoAtividade + (s.observacoes ? `\nObs: ${s.observacoes}` : ''),
        ])
      : [['-', 'Nenhum serviço registrado no período.', '-', '-', '-', '-', '-', '-', '-', '-']];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        {
          content: 'SERVIÇOS DESENVOLVIDOS NO PERÍODO (Quantitativos são estimativas geométricas)',
          colSpan: 10,
          styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] },
        },
      ],
      servicosHeader.map((h) => ({ content: h, styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'center' } })),
    ],
    body: servicosRows as any,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 16, halign: 'right' },
      4: { cellWidth: 14, halign: 'right' },
      5: { cellWidth: 14, halign: 'right' },
      6: { cellWidth: 16, halign: 'right' },
      7: { cellWidth: 16, halign: 'right' },
      8: { cellWidth: 18, halign: 'center' },
      9: { cellWidth: 'auto' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 6. Eventos com Restrições (Anexo A / B)
  const categoriasOficiais: CategoriaRestricao[] = [
    'Pessoal',
    'Equipamentos',
    'Instalações',
    'Cronograma físico',
    'Qualidade',
    'Atendimento à fiscalização',
    'Administração da obra',
    'Meio ambiente',
  ];

  const catMarcadas = categoriasOficiais
    .map((cat) => `${cat}: ${rdo.restricoesCategorias?.[cat] ? '[ R ]' : '[   ]'}`)
    .join('  |  ');

  const eventosTexto =
    rdo.semRestricoes || rdo.eventosRestricoes.length === 0
      ? 'DECLARAÇÃO: Sem restrições registradas no período de execução.'
      : rdo.eventosRestricoes
          .map(
            (ev, i) =>
              `${i + 1}. [${ev.categoria}] ${ev.descricao} | Horário: ${ev.dataHora} | Responsável: ${ev.responsavel} | Providência: ${ev.providencia} | Situação: ${ev.situacao}`
          )
          .join('\n');

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        {
          content: 'EVENTOS COM RESTRIÇÕES (Marcar R quando houver restrição)',
          styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] },
        },
      ],
    ],
    body: [[`${catMarcadas}\n\n${eventosTexto}`]],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 7. Comentários das Partes e Ordens de Serviço
  const comentariosTexto =
    rdo.comentarios.length > 0
      ? rdo.comentarios
          .map((c) => `[${c.origem.toUpperCase()}] ${c.autor} (${c.tipo} - ${c.dataHora}):\n${c.texto}`)
          .join('\n\n')
      : 'Nenhum comentário registrado.';

  const ordensTexto =
    rdo.ordensServico && rdo.ordensServico.length > 0
      ? rdo.ordensServico
          .map((os) => `• ${os.numero} | Segmento: ${os.segmento} | Natureza: ${os.naturezaServico}`)
          .join('\n')
      : 'Nenhuma Ordem de Serviço vinculada no período.';

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        { content: 'COMENTÁRIOS E APONTAMENTOS DAS PARTES', styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] } },
        { content: 'ORDENS DE SERVIÇO VINCULADAS', styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] } },
      ],
    ],
    body: [[comentariosTexto, ordensTexto]],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 8. Considerações da Construtora, Supervisora e Fiscalização
  const consConstrutora = rdo.consideracoesConstrutora || 'Sem manifestação adicional no período.';
  const consSupervisora = rdo.consideracoesSupervisora || 'Sem manifestação adicional no período.';
  const consFiscalizacao = rdo.consideracoesFiscalizacao || 'Sem manifestação adicional no período.';

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        {
          content: 'CONSIDERAÇÕES FORMAIS DAS PARTES',
          colSpan: 3,
          styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] },
        },
      ],
      [
        { content: 'CONSTRUTORA EXECUTORA', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: 'SUPERVISORA', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: 'FISCALIZAÇÃO DO DNIT', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      ],
    ],
    body: [[consConstrutora, consSupervisora, consFiscalizacao]],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.5 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 9. Fotografias com Legendas e Metadados
  if (rdo.fotografias && rdo.fotografias.length > 0) {
    const fotosRows = rdo.fotografias.map((f, i) => [
      `Foto ${i + 1}`,
      f.legenda || f.descricao || 'Evidência fotográfica',
      `${f.servicoRelacionado || '-'} (${f.segmento || '-'})`,
      f.latitude && f.longitude ? `${f.latitude.toFixed(6)}, ${f.longitude.toFixed(6)}` : 'Não informadas',
      f.dataCaptura || f.dataExecucao || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [
        [
          {
            content: 'REGISTRO DE EVIDÊNCIAS FOTOGRÁFICAS E METADADOS',
            colSpan: 5,
            styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] },
          },
        ],
        [
          { content: 'Item', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'center' } },
          { content: 'Legenda / Descrição', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: 'Serviço / Segmento', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: 'Coordenadas (Lat, Long)', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
          { content: 'Data / Horário', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
        ],
      ],
      body: fotosRows as any,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;
  }

  // 10. Campos de Identificação dos Responsáveis (Sem assinaturas digitais fictícias)
  const respExec = rdo.identificacaoResponsaveis?.executora || {
    nome: contrato?.responsavelTecnicoExecutora || '',
    cargo: 'Responsável Técnico da Executora',
    email: contrato?.emailResponsavelExecutora || '',
    artCrea: contrato?.artCreaExecutora || '',
  };

  const respSup = rdo.identificacaoResponsaveis?.supervisora || {
    nome: contrato?.responsavelTecnicoSupervisora || '',
    cargo: 'Responsável Técnico da Supervisora',
    email: contrato?.emailResponsavelSupervisora || '',
    artCrea: contrato?.artCreaSupervisora || '',
  };

  const respDnit = rdo.identificacaoResponsaveis?.fiscalizacaoDnit || {
    nome: contrato?.fiscalDnit || '',
    cargo: 'Fiscal do Contrato - DNIT',
    email: contrato?.emailFiscalDnit || '',
    portaria: contrato?.portariaFiscal || '',
  };

  const blocoExecutora = [
    'EMPRESA EXECUTORA',
    respExec.nome || 'Nome a preencher',
    respExec.cargo || 'Responsável Técnico',
    respExec.email ? `E-mail: ${respExec.email}` : '',
    respExec.artCrea ? `ART/CREA: ${respExec.artCrea}` : '',
    '\n____________________________________\nAssinatura do Responsável',
  ]
    .filter(Boolean)
    .join('\n');

  const blocoSupervisora = [
    'EMPRESA SUPERVISORA',
    respSup.nome || 'Nome a preencher',
    respSup.cargo || 'Responsável Técnico',
    respSup.email ? `E-mail: ${respSup.email}` : '',
    respSup.artCrea ? `ART/CREA: ${respSup.artCrea}` : '',
    '\n____________________________________\nAssinatura do Supervisor',
  ]
    .filter(Boolean)
    .join('\n');

  const blocoDnit = [
    'FISCALIZAÇÃO DO DNIT',
    respDnit.nome || 'Nome a preencher',
    respDnit.cargo || 'Fiscal do Contrato',
    respDnit.email ? `E-mail: ${respDnit.email}` : '',
    respDnit.portaria ? `Portaria: ${respDnit.portaria}` : '',
    '\n____________________________________\nVisto da Fiscalização DNIT',
  ]
    .filter(Boolean)
    .join('\n');

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      [
        {
          content: 'TERMO DE IDENTIFICAÇÃO E ENCERRAMENTO (Conforme Anexo A — Norma DNIT 097/2025 – PRO)',
          colSpan: 3,
          styles: { fontStyle: 'bold', fillColor: [11, 59, 96], textColor: [255, 255, 255] },
        },
      ],
    ],
    body: [[blocoExecutora, blocoSupervisora, blocoDnit]],
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 3, halign: 'center' },
  });

  // Numeração de páginas e rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    // Rodapé
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
    doc.text(
      `RDO Digital DNIT | Contrato: ${numeroContrato} | Data: ${dataFormatada} | RDO nº ${rdo.numeroSequencial}`,
      margin,
      pageHeight - 6
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 6, {
      align: 'right',
    });
  }

  // Nome do arquivo
  const nomeArquivo = `RDO_${rdo.numeroSequencial.toString().padStart(4, '0')}_${rdo.data}_${numeroContrato.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(nomeArquivo);
}
