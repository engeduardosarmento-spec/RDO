import { parseISO, differenceInCalendarDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Calcula a extensão em metros entre dois marcos quilométricos.
 * Fórmula DNIT: Extensão em metros = (quilômetro final − quilômetro inicial) × 1.000.
 */
export function calcularExtensaoMetros(kmInicial: number, kmFinal: number): number {
  if (isNaN(kmInicial) || isNaN(kmFinal) || kmFinal < kmInicial) {
    return 0;
  }
  const diff = kmFinal - kmInicial;
  return Math.round(diff * 1000 * 100) / 100;
}

/**
 * Calcula área estimada em m²: extensão em metros × largura em metros.
 */
export function calcularAreaM2(extensaoMetros?: number, larguraMetros?: number): number | undefined {
  if (
    extensaoMetros === undefined ||
    larguraMetros === undefined ||
    isNaN(extensaoMetros) ||
    isNaN(larguraMetros) ||
    extensaoMetros <= 0 ||
    larguraMetros <= 0
  ) {
    return undefined;
  }
  return Math.round(extensaoMetros * larguraMetros * 100) / 100;
}

/**
 * Calcula volume geométrico estimado em m³: extensão em metros × largura em metros × espessura em metros.
 */
export function calcularVolumeM3(
  extensaoMetros?: number,
  larguraMetros?: number,
  espessuraMetros?: number
): number | undefined {
  if (
    extensaoMetros === undefined ||
    larguraMetros === undefined ||
    espessuraMetros === undefined ||
    isNaN(extensaoMetros) ||
    isNaN(larguraMetros) ||
    isNaN(espessuraMetros) ||
    extensaoMetros <= 0 ||
    larguraMetros <= 0 ||
    espessuraMetros <= 0
  ) {
    return undefined;
  }
  return Math.round(extensaoMetros * larguraMetros * espessuraMetros * 100) / 100;
}

/**
 * Calcula os prazos contratuais:
 * - Prazo decorrido: dias corridos entre a data de início da obra e a data do relatório.
 * - Prazo a vencer: dias restantes até o término contratual previsto.
 */
export function calcularPrazosContratuais(
  dataInicioIso: string,
  dataRelatorioIso: string,
  prazoContratualDiasTotal: number,
  dataPrevisaoConclusaoIso?: string
): { prazoDecorrido: number; prazoAVencer: number; regraCalculo: string } {
  try {
    const inicio = parseISO(dataInicioIso);
    const relatorio = parseISO(dataRelatorioIso);

    const decorrido = differenceInCalendarDays(relatorio, inicio);
    const prazoDecorridoCalculado = Math.max(0, decorrido);

    let prazoAVencerCalculado = 0;
    if (dataPrevisaoConclusaoIso) {
      const termino = parseISO(dataPrevisaoConclusaoIso);
      prazoAVencerCalculado = Math.max(0, differenceInCalendarDays(termino, relatorio));
    } else {
      prazoAVencerCalculado = Math.max(0, prazoContratualDiasTotal - prazoDecorridoCalculado);
    }

    const regra = `Prazo decorrido calculado em dias corridos (${prazoDecorridoCalculado} dias desde ${formatarDataBR(dataInicioIso)}). Prazo a vencer: ${prazoAVencerCalculado} dias.`;

    return {
      prazoDecorrido: prazoDecorridoCalculado,
      prazoAVencer: prazoAVencerCalculado,
      regraCalculo: regra,
    };
  } catch {
    return {
      prazoDecorrido: 0,
      prazoAVencer: prazoContratualDiasTotal,
      regraCalculo: 'Não foi possível calcular com as datas informadas.',
    };
  }
}

/**
 * Obtém o dia da semana formatado em português.
 */
export function obterDiaSemanaExtenso(dataIso: string): string {
  try {
    const date = parseISO(dataIso);
    const dia = format(date, 'EEEE', { locale: ptBR });
    return dia.charAt(0).toUpperCase() + dia.slice(1);
  } catch {
    return '';
  }
}

/**
 * Formata data ISO (YYYY-MM-DD) para formato brasileiro DD/MM/AAAA.
 */
export function formatarDataBR(dataIso?: string): string {
  if (!dataIso) return '-';
  try {
    const [ano, mes, dia] = dataIso.split('-');
    if (ano && mes && dia) {
      return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
    }
    const d = parseISO(dataIso);
    return format(d, 'dd/MM/yyyy');
  } catch {
    return dataIso;
  }
}

/**
 * Formata quilômetro para padrão DNIT (ex: km 272,600).
 */
export function formatarKm(km?: number): string {
  if (km === undefined || isNaN(km)) return 'km -';
  const valorFormatado = km.toLocaleString('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  return `km ${valorFormatado}`;
}

/**
 * Formata metros no padrão brasileiro (ex: 500,00 m).
 */
export function formatarMetros(m?: number): string {
  if (m === undefined || isNaN(m)) return '-';
  return `${m.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
}

/**
 * Formata área no padrão brasileiro (ex: 4.500,00 m²).
 */
export function formatarArea(a?: number): string {
  if (a === undefined || isNaN(a)) return '-';
  return `${a.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`;
}

/**
 * Formata volume no padrão brasileiro (ex: 900,00 m³).
 */
export function formatarVolume(v?: number): string {
  if (v === undefined || isNaN(v)) return '-';
  return `${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³`;
}

/**
 * Formata número genérico no padrão pt-BR.
 */
export function formatarNumeroBR(valor?: number, decimais: number = 2): string {
  if (valor === undefined || isNaN(valor)) return '-';
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  });
}
