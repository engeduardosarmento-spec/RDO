import type { Rdo, Contrato } from '../types';
import { formatarDataBR, formatarKm, formatarMetros } from './calculations';

/**
 * Mapeia o status do serviço para formato legível no WhatsApp
 */
function traduzirSituacaoServico(sit: string): string {
  switch (sit) {
    case 'Nao_iniciado':
      return 'Não iniciado';
    case 'Em_execucao':
      return 'Em execução';
    case 'Parcialmente_executado':
      return 'Parcialmente executado';
    case 'Concluido':
      return 'Concluído';
    case 'Interrompido':
      return 'Interrompido';
    default:
      return sit;
  }
}

/**
 * Gera o texto estruturado para envio ou cópia para o WhatsApp
 * conforme especificação do Item 14 da Norma DNIT 097/2025.
 */
export function gerarResumoWhatsApp(rdo: Rdo, contrato?: Contrato): string {
  const dataFormatada = formatarDataBR(rdo.data);
  const empresa = contrato?.empresaExecutora || 'Não informada';
  const numeroContrato = contrato?.numeroContrato || 'Não informado';
  const rodoviaUf = contrato ? `${contrato.rodovia}/${contrato.uf}` : 'Não informada';

  let texto = `📋 RELATÓRIO DIÁRIO DE OBRA (RDO) nº ${rdo.numeroSequencial}\n\n`;
  texto += `Data: ${dataFormatada} (${rdo.diaSemana || ''})\n`;
  texto += `Empresa Executora: ${empresa}\n`;
  texto += `Contrato: ${numeroContrato}\n`;
  texto += `Rodovia: ${rodoviaUf}\n\n`;

  // SERVIÇOS EXECUTADOS
  texto += `SERVIÇOS EXECUTADOS\n\n`;
  if (rdo.servicosExecutados.length === 0) {
    texto += `Nenhum serviço registrado no período.\n\n`;
  } else {
    rdo.servicosExecutados.forEach((srv, index) => {
      texto += `${index + 1}. ${srv.nomeServico}\n`;
      texto += `Segmento: ${formatarKm(srv.kmInicial)} ao ${formatarKm(srv.kmFinal)}\n`;
      texto += `Extensão: ${formatarMetros(srv.extensaoInformadaMetros || srv.extensaoCalculadaMetros)}\n`;
      if (srv.larguraMetros !== undefined && srv.larguraMetros > 0) {
        texto += `Largura: ${formatarMetros(srv.larguraMetros)}\n`;
      }
      if (srv.espessuraMetros !== undefined && srv.espessuraMetros > 0) {
        texto += `Espessura: ${formatarMetros(srv.espessuraMetros)}\n`;
      }
      texto += `Situação: ${traduzirSituacaoServico(srv.situacao)}\n`;
      if (srv.descricaoAtividade) {
        texto += `Descrição: ${srv.descricaoAtividade}\n`;
      }
      texto += `\n`;
    });
  }

  // CONDIÇÕES CLIMÁTICAS
  texto += `CONDIÇÕES CLIMÁTICAS\n`;
  texto += `Manhã: ${rdo.climaManha.condicaoTempo} — ${rdo.climaManha.condicaoTrabalho}.\n`;
  texto += `Tarde: ${rdo.climaTarde.condicaoTempo} — ${rdo.climaTarde.condicaoTrabalho}.\n`;
  if (rdo.ocorrenciasMeteorologicas && rdo.ocorrenciasMeteorologicas.trim() !== '') {
    texto += `Ocorrências: ${rdo.ocorrenciasMeteorologicas}\n`;
  }
  texto += `\n`;

  // EQUIPE DE CAMPO
  const diretaTotal = rdo.maoDeObra
    .filter((m) => m.categoria === 'direta')
    .reduce((acc, cur) => acc + (cur.quantidade || 0), 0);
  const indiretaTotal = rdo.maoDeObra
    .filter((m) => m.categoria === 'indireta')
    .reduce((acc, cur) => acc + (cur.quantidade || 0), 0);

  texto += `EQUIPE DE CAMPO\n`;
  if (rdo.apontador) texto += `Apontador: ${rdo.apontador}\n`;
  if (rdo.encarregado) texto += `Encarregado: ${rdo.encarregado}\n`;
  texto += `Mão de obra direta: ${diretaTotal} colaboradores.\n`;
  texto += `Mão de obra indireta: ${indiretaTotal} colaboradores.\n`;
  texto += `\n`;

  // EQUIPAMENTOS
  texto += `EQUIPAMENTOS\n`;
  if (rdo.equipamentos.length === 0) {
    texto += `Nenhum equipamento registrado.\n`;
  } else {
    const totalEq = rdo.equipamentos.reduce((acc, cur) => acc + cur.quantidade, 0);
    const opEq = rdo.equipamentos
      .filter((e) => e.situacao === 'operacional')
      .reduce((acc, cur) => acc + cur.quantidade, 0);

    rdo.equipamentos.forEach((eq) => {
      const placa = eq.placaPatrimonio ? ` (${eq.placaPatrimonio})` : '';
      const sit = eq.situacao === 'operacional' ? 'operacional' : eq.situacao === 'parcialmente_operacional' ? 'parcial' : 'indisponível';
      texto += `• ${eq.quantidade}x ${eq.descricao}${placa} [${sit}]\n`;
    });
    texto += `Total: ${totalEq} equipamentos (${opEq} operacionais).\n`;
  }
  texto += `\n`;

  // OCORRÊNCIAS E RESTRIÇÕES
  texto += `OCORRÊNCIAS E RESTRIÇÕES\n`;
  if (rdo.semRestricoes || rdo.eventosRestricoes.length === 0) {
    texto += `Sem restrições registradas no período.\n`;
  } else {
    rdo.eventosRestricoes.forEach((ev, i) => {
      texto += `${i + 1}. [${ev.categoria}] ${ev.descricao} (Providência: ${ev.providencia})\n`;
    });
  }
  texto += `\n`;

  // OBSERVAÇÕES DA SUPERVISÃO / CONSIDERAÇÕES
  if (rdo.consideracoesSupervisora && rdo.consideracoesSupervisora.trim() !== '') {
    texto += `OBSERVAÇÕES DA SUPERVISÃO\n`;
    texto += `${rdo.consideracoesSupervisora}\n\n`;
  }

  // CONSIDERAÇÕES DA FISCALIZAÇÃO DNIT
  if (rdo.consideracoesFiscalizacao && rdo.consideracoesFiscalizacao.trim() !== '') {
    texto += `FISCALIZAÇÃO DO DNIT\n`;
    texto += `${rdo.consideracoesFiscalizacao}\n\n`;
  }

  texto += `Gerado via RDO Digital DNIT (Norma 097/2025 – PRO)`;

  return texto;
}

/**
 * Dispara o envio ou abertura do WhatsApp Web/App com a mensagem codificada
 */
export function abrirWhatsAppComTexto(mensagem: string): void {
  const textoCodificado = encodeURIComponent(mensagem);
  const url = `https://api.whatsapp.com/send?text=${textoCodificado}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Compartilha o texto usando Web Share API do celular se disponível
 */
export async function compartilharViaWebShare(titulo: string, texto: string): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: titulo,
        text: texto,
      });
      return true;
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Erro ao compartilhar:', e);
      }
      return false;
    }
  }
  return false;
}
