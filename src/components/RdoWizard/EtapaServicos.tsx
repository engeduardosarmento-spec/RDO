import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  AlertTriangle,
  Calculator,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  Copy,
} from 'lucide-react';
import type { Rdo, Contrato, CatalogoServico, ServicoExecutadoItem, SituacaoServico } from '../../types';
import {
  calcularExtensaoMetros,
  calcularAreaM2,
  calcularVolumeM3,
  formatarKm,
  formatarMetros,
  formatarArea,
  formatarVolume,
} from '../../utils/calculations';

interface EtapaServicosProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
  contrato?: Contrato;
  catalogoServicos: CatalogoServico[];
}

const situacoesServico: Array<{ valor: SituacaoServico; label: string; cor: string }> = [
  { valor: 'Concluido', label: 'Concluído', cor: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { valor: 'Em_execucao', label: 'Em execução', cor: 'bg-blue-100 text-blue-800 border-blue-300' },
  { valor: 'Parcialmente_executado', label: 'Parcialmente executado', cor: 'bg-amber-100 text-amber-800 border-amber-300' },
  { valor: 'Interrompido', label: 'Interrompido', cor: 'bg-red-100 text-red-800 border-red-300' },
  { valor: 'Nao_iniciado', label: 'Não iniciado', cor: 'bg-slate-100 text-slate-700 border-slate-300' },
];

export const EtapaServicos: React.FC<EtapaServicosProps> = ({
  rdo,
  onChange,
  contrato,
  catalogoServicos,
}) => {
  const [itemAbertoId, setItemAbertoId] = useState<string | null>(
    rdo.servicosExecutados.length > 0 ? rdo.servicosExecutados[0].id : null
  );

  const servicosContrato = catalogoServicos.filter((s) => s.contratoId === (contrato ? contrato.id : ''));

  const handleAdicionarServico = () => {
    const servicoPadrao = servicosContrato[0];
    const kmInicial = contrato?.segmentoInicialKm || 0;
    const kmFinal = Math.min((contrato?.segmentoFinalKm || kmInicial + 0.5), kmInicial + 0.5);
    const extensaoCalc = calcularExtensaoMetros(kmInicial, kmFinal);

    const largura = servicoPadrao?.larguraPadrao;
    const espessura = servicoPadrao?.espessuraPadrao;

    const area = largura ? calcularAreaM2(extensaoCalc, largura) : undefined;
    const vol = largura && espessura ? calcularVolumeM3(extensaoCalc, largura, espessura) : undefined;

    const novoItem: ServicoExecutadoItem = {
      id: `se-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      servicoCatalogoId: servicoPadrao?.id,
      nomeServico: servicoPadrao?.nome || 'Novo Serviço Rodoviário',
      grupoServico: servicoPadrao?.grupo || 'Pavimentação — pista e acostamento',
      descricaoAtividade: servicoPadrao?.descricaoPadrao || '',
      rodovia: contrato?.rodovia || 'BR-364',
      uf: contrato?.uf || 'AC',
      estacaInicial: '',
      estacaFinal: '',
      kmInicial,
      kmFinal,
      extensaoCalculadaMetros: extensaoCalc,
      extensaoInformadaMetros: extensaoCalc,
      extensaoDivergente: false,
      larguraMetros: largura,
      espessuraMetros: espessura,
      areaCalculadaM2: area,
      volumeCalculadoM3: vol,
      unidadeMedicao: servicoPadrao?.unidade || 'm²',
      situacao: 'Concluido',
      observacoes: '',
    };

    const novaLista = [...rdo.servicosExecutados, novoItem];
    onChange({ servicosExecutados: novaLista });
    setItemAbertoId(novoItem.id);
  };

  const handleDuplicarServico = (itemOriginal: ServicoExecutadoItem) => {
    const duplicado: ServicoExecutadoItem = {
      ...itemOriginal,
      id: `se-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      kmInicial: itemOriginal.kmFinal,
      kmFinal: itemOriginal.kmFinal + (itemOriginal.kmFinal - itemOriginal.kmInicial),
    };

    // Recalcula extensão
    const ext = calcularExtensaoMetros(duplicado.kmInicial, duplicado.kmFinal);
    duplicado.extensaoCalculadaMetros = ext;
    duplicado.extensaoInformadaMetros = ext;
    duplicado.extensaoDivergente = false;
    if (duplicado.larguraMetros) {
      duplicado.areaCalculadaM2 = calcularAreaM2(ext, duplicado.larguraMetros);
      if (duplicado.espessuraMetros) {
        duplicado.volumeCalculadoM3 = calcularVolumeM3(ext, duplicado.larguraMetros, duplicado.espessuraMetros);
      }
    }

    const novaLista = [...rdo.servicosExecutados, duplicado];
    onChange({ servicosExecutados: novaLista });
    setItemAbertoId(duplicado.id);
  };

  const handleRemoverServico = (id: string) => {
    const novaLista = rdo.servicosExecutados.filter((s) => s.id !== id);
    onChange({ servicosExecutados: novaLista });
    if (itemAbertoId === id) {
      setItemAbertoId(novaLista.length > 0 ? novaLista[0].id : null);
    }
  };

  const handleAtualizarCampo = (id: string, campo: keyof ServicoExecutadoItem, valor: any) => {
    const novaLista = rdo.servicosExecutados.map((item) => {
      if (item.id !== id) return item;

      const atualizado = { ...item, [campo]: valor };

      // Se mudou o serviço do catálogo selecionado, preenche grupo, descrição e unidade
      if (campo === 'servicoCatalogoId') {
        const cat = catalogoServicos.find((s) => s.id === valor);
        if (cat) {
          atualizado.nomeServico = cat.nome;
          atualizado.grupoServico = cat.grupo;
          atualizado.unidadeMedicao = cat.unidade;
          if (!atualizado.descricaoAtividade) {
            atualizado.descricaoAtividade = cat.descricaoPadrao || '';
          }
          if (cat.larguraPadrao && !atualizado.larguraMetros) {
            atualizado.larguraMetros = cat.larguraPadrao;
          }
          if (cat.espessuraPadrao && !atualizado.espessuraMetros) {
            atualizado.espessuraMetros = cat.espessuraPadrao;
          }
        }
      }

      // Recálculo automático de Extensão quando mudam kmInicial ou kmFinal
      if (campo === 'kmInicial' || campo === 'kmFinal') {
        const kmIni = campo === 'kmInicial' ? Number(valor) : atualizado.kmInicial;
        const kmFim = campo === 'kmFinal' ? Number(valor) : atualizado.kmFinal;

        const calcExt = calcularExtensaoMetros(kmIni, kmFim);
        atualizado.extensaoCalculadaMetros = calcExt;

        // Se o usuário ainda não tinha divergido manualmente, mantém sincronizado
        if (!atualizado.extensaoDivergente) {
          atualizado.extensaoInformadaMetros = calcExt;
        } else {
          // Checa se a divergência ainda existe
          atualizado.extensaoDivergente = Math.abs(calcExt - atualizado.extensaoInformadaMetros) > 0.01;
        }
      }

      // Se o usuário editou manualmente a extensão em metros
      if (campo === 'extensaoInformadaMetros') {
        const extInf = Number(valor);
        atualizado.extensaoInformadaMetros = extInf;
        atualizado.extensaoDivergente = Math.abs(extInf - atualizado.extensaoCalculadaMetros) > 0.01;
      }

      // Recalcula Área e Volume geométrico quando dimensões mudam
      const extFinal = atualizado.extensaoInformadaMetros || atualizado.extensaoCalculadaMetros;
      const larg = atualizado.larguraMetros;
      const esp = atualizado.espessuraMetros;

      atualizado.areaCalculadaM2 = calcularAreaM2(extFinal, larg);
      atualizado.volumeCalculadoM3 = calcularVolumeM3(extFinal, larg, esp);

      return atualizado;
    });

    onChange({ servicosExecutados: novaLista });
  };

  return (
    <div className="space-y-6">
      {/* Barra de Ação Superior */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Serviços e Segmentos Executados ({rdo.servicosExecutados.length})
          </h3>
          <p className="text-xs text-slate-500">
            Adicione múltiplos serviços ou segmentos independentes no mesmo dia de obra
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdicionarServico}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0b3b60] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#082842] transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          Adicionar Serviço
        </button>
      </div>

      {rdo.servicosExecutados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-700 mb-3">
            <Layers className="h-7 w-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Nenhum serviço lançado neste RDO</h4>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Clique no botão abaixo para adicionar o primeiro serviço do dia com seus respectivos segmentos quilométricos e dimensões.
          </p>
          <button
            type="button"
            onClick={handleAdicionarServico}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842]"
          >
            <Plus className="h-4 w-4" />
            Adicionar Serviço
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {rdo.servicosExecutados.map((item, index) => {
            const estaAberto = itemAbertoId === item.id;
            const kmInvalido = item.kmFinal < item.kmInicial;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition"
              >
                {/* Cabeçalho do Card de Serviço (Accordion) */}
                <div
                  className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer transition border-b border-slate-200/60"
                  onClick={() => setItemAbertoId(estaAberto ? null : item.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0b3b60] text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.nomeServico}
                        </span>
                        <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 truncate">
                          {formatarKm(item.kmInicial)} ao {formatarKm(item.kmFinal)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Extensão: {formatarMetros(item.extensaoInformadaMetros || item.extensaoCalculadaMetros)}
                        {item.areaCalculadaM2 ? ` • Área: ${formatarArea(item.areaCalculadaM2)}` : ''}
                        {item.volumeCalculadoM3 ? ` • Volume: ${formatarVolume(item.volumeCalculadoM3)}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                        situacoesServico.find((s) => s.valor === item.situacao)?.cor ||
                        'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {situacoesServico.find((s) => s.valor === item.situacao)?.label || item.situacao}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicarServico(item);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      title="Duplicar segmento para o próximo trecho"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoverServico(item.id);
                      }}
                      className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-700"
                      title="Remover serviço"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <div className="text-slate-400 p-1">
                      {estaAberto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Formulário detalhado do serviço */}
                {estaAberto && (
                  <div className="p-6 space-y-5">
                    {/* Linha 1: Seleção do catálogo, grupo e situação */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Serviço do Catálogo *
                        </label>
                        <select
                          value={item.servicoCatalogoId || ''}
                          onChange={(e) => handleAtualizarCampo(item.id, 'servicoCatalogoId', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                        >
                          <option value="">Personalizado / Outro serviço</option>
                          {servicosContrato.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nome} ({s.grupo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Grupo de Serviço (Norma DNIT) *
                        </label>
                        <input
                          type="text"
                          value={item.grupoServico}
                          onChange={(e) => handleAtualizarCampo(item.id, 'grupoServico', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Situação da Atividade *
                        </label>
                        <select
                          value={item.situacao}
                          onChange={(e) => handleAtualizarCampo(item.id, 'situacao', e.target.value as SituacaoServico)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                        >
                          {situacoesServico.map((s) => (
                            <option key={s.valor} value={s.valor}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Linha 2: Localização, Estacas e Quilometragem */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
                        <span>Segmento e Localização do Serviço</span>
                        <span className="text-[11px] text-slate-500 lowercase font-normal">
                          Extensão calculada: (km final - km inicial) × 1.000 m
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Rodovia / UF
                          </label>
                          <input
                            type="text"
                            value={`${item.rodovia}/${item.uf}`}
                            readOnly
                            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Estaca Inicial (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 13630"
                            value={item.estacaInicial || ''}
                            onChange={(e) => handleAtualizarCampo(item.id, 'estacaInicial', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Estaca Final (Opcional)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 13655"
                            value={item.estacaFinal || ''}
                            onChange={(e) => handleAtualizarCampo(item.id, 'estacaFinal', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Km Inicial *
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            required
                            placeholder="272.600"
                            value={item.kmInicial}
                            onChange={(e) => handleAtualizarCampo(item.id, 'kmInicial', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Km Final *
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            required
                            placeholder="273.100"
                            value={item.kmFinal}
                            onChange={(e) => handleAtualizarCampo(item.id, 'kmFinal', parseFloat(e.target.value) || 0)}
                            className={`w-full rounded-lg border bg-white px-2.5 py-1.5 text-xs font-bold focus:outline-hidden ${
                              kmInvalido
                                ? 'border-red-500 text-red-700 bg-red-50'
                                : 'border-slate-300 text-slate-800 focus:border-blue-500'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Extensão em Metros *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.extensaoInformadaMetros}
                            onChange={(e) =>
                              handleAtualizarCampo(
                                item.id,
                                'extensaoInformadaMetros',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-bold text-center ${
                              item.extensaoDivergente
                                ? 'border-amber-400 bg-amber-50 text-amber-900'
                                : 'border-slate-300 bg-white text-slate-800'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Alertas de validação de quilometragem e divergência de extensão */}
                      {kmInvalido && (
                        <div className="flex items-center gap-2 text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>O quilômetro final deve ser maior ou igual ao quilômetro inicial!</span>
                        </div>
                      )}

                      {item.extensaoDivergente && (
                        <div className="flex items-center justify-between gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                            <span>
                              <strong>Divergência detectada:</strong> Extensão geométrica calculada:{' '}
                              <strong>{formatarMetros(item.extensaoCalculadaMetros)}</strong> | Informada:{' '}
                              <strong>{formatarMetros(item.extensaoInformadaMetros)}</strong>.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleAtualizarCampo(
                                item.id,
                                'extensaoInformadaMetros',
                                item.extensaoCalculadaMetros
                              )
                            }
                            className="text-[11px] underline font-bold hover:text-amber-950 whitespace-nowrap"
                          >
                            Compatibilizar com cálculo
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Linha 3: Dimensões (Largura, Espessura) e Cálculos Geométricos */}
                    <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-sky-900">
                        <div className="flex items-center gap-1.5">
                          <Calculator className="h-4 w-4 text-sky-700" />
                          <span>Dimensões e Quantitativos Geométricos Estimados</span>
                        </div>
                        <span className="text-[10px] text-sky-700 lowercase font-medium">
                          estimativas geométricas — não substituem a medição contratual
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Largura em Metros (m)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 8.00"
                            value={item.larguraMetros !== undefined ? item.larguraMetros : ''}
                            onChange={(e) =>
                              handleAtualizarCampo(
                                item.id,
                                'larguraMetros',
                                e.target.value === '' ? undefined : parseFloat(e.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Espessura em Metros (m)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Ex: 0.15"
                            value={item.espessuraMetros !== undefined ? item.espessuraMetros : ''}
                            onChange={(e) =>
                              handleAtualizarCampo(
                                item.id,
                                'espessuraMetros',
                                e.target.value === '' ? undefined : parseFloat(e.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Área Calculada (m²)
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={formatarArea(item.areaCalculadaM2)}
                            className="w-full rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-bold text-sky-950 text-center cursor-default"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Volume Geométrico (m³)
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={formatarVolume(item.volumeCalculadoM3)}
                            className="w-full rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-bold text-sky-950 text-center cursor-default"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Unidade de Medição
                          </label>
                          <input
                            type="text"
                            value={item.unidadeMedicao}
                            onChange={(e) => handleAtualizarCampo(item.id, 'unidadeMedicao', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Descrição e Observações */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Descrição da Atividade Efetivamente Realizada *
                        </label>
                        <textarea
                          rows={3}
                          required
                          placeholder="Detalhar o método executivo, espalhamento, compactação, equipamentos e materiais empregados..."
                          value={item.descricaoAtividade}
                          onChange={(e) => handleAtualizarCampo(item.id, 'descricaoAtividade', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Observações Técnicas / Controle Tecnológico
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Resultados de ensaios laboratoriais, umidade ótima, grau de compactação, liberação topográfica..."
                          value={item.observacoes || ''}
                          onChange={(e) => handleAtualizarCampo(item.id, 'observacoes', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
