import React, { useState } from 'react';
import { Truck, Plus, Trash2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { Rdo, EquipamentoItem, SituacaoEquipamento } from '../../types';

interface EtapaEquipamentosProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
}

const equipamentosSugeridos = [
  'Motoniveladora Caterpillar 140K',
  'Rolo Compactador Vibratório Dynapac CA250',
  'Caminhão Tanque Pipa 15.000 L',
  'Caminhão Basculante Traçado 14 m³',
  'Pá Carregadeira Hyundai HL760',
  'Retroescavadeira JCB 3CX',
  'Trator de Esteira Komatsu D61EX',
  'Espargidor de Asfalto Hidráulico',
  'Vibroacabadora de Asfalto',
  'Compressor de Ar Rebocável',
  'Caminhão Guincho / Prancha',
];

export const EtapaEquipamentos: React.FC<EtapaEquipamentosProps> = ({ rdo, onChange }) => {
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [placaPatrimonio, setPlacaPatrimonio] = useState('');
  const [situacao, setSituacao] = useState<SituacaoEquipamento>('operacional');
  const [observacoes, setObservacoes] = useState('');

  const totalGeral = rdo.equipamentos.reduce((acc, cur) => acc + (cur.quantidade || 0), 0);
  const totalOperacionais = rdo.equipamentos
    .filter((e) => e.situacao === 'operacional')
    .reduce((acc, cur) => acc + (cur.quantidade || 0), 0);
  const totalParciais = rdo.equipamentos
    .filter((e) => e.situacao === 'parcialmente_operacional')
    .reduce((acc, cur) => acc + (cur.quantidade || 0), 0);
  const totalIndisponiveis = rdo.equipamentos
    .filter((e) => e.situacao === 'indisponivel')
    .reduce((acc, cur) => acc + (cur.quantidade || 0), 0);

  const handleAdicionar = () => {
    if (!descricao.trim() || quantidade <= 0) return;

    const novoEquip: EquipamentoItem = {
      id: `eq-${Date.now()}`,
      descricao: descricao.trim(),
      quantidade,
      placaPatrimonio: placaPatrimonio.trim() || undefined,
      situacao,
      observacoes: observacoes.trim() || undefined,
    };

    onChange({
      equipamentos: [...rdo.equipamentos, novoEquip],
    });

    setDescricao('');
    setQuantidade(1);
    setPlacaPatrimonio('');
    setObservacoes('');
    setSituacao('operacional');
  };

  const handleRemover = (id: string) => {
    onChange({
      equipamentos: rdo.equipamentos.filter((e) => e.id !== id),
    });
  };

  const handleAtualizar = (id: string, campo: keyof EquipamentoItem, valor: any) => {
    onChange({
      equipamentos: rdo.equipamentos.map((e) => (e.id === id ? { ...e, [campo]: valor } : e)),
    });
  };

  return (
    <div className="space-y-6">
      {/* Indicadores de Totais de Equipamentos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Equipamentos
          </span>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalGeral}</div>
          <span className="text-[10px] text-slate-400">Total mobilizado</span>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-center shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Operacionais
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-950">{totalOperacionais}</div>
          <span className="text-[10px] text-emerald-700">100% em atividade</span>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-center shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Parciais
          </span>
          <div className="mt-1 text-2xl font-bold text-amber-950">{totalParciais}</div>
          <span className="text-[10px] text-amber-700">Com restrição mecânica</span>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50/70 p-4 text-center shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-800">
            Indisponíveis
          </span>
          <div className="mt-1 text-2xl font-bold text-red-950">{totalIndisponiveis}</div>
          <span className="text-[10px] text-red-700">Em manutenção / quebrado</span>
        </div>
      </div>

      {/* Formulário de Adicionar Equipamento */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Truck className="h-4 w-4 text-sky-700" />
          <span>Cadastrar Equipamento / Maquinário</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo / Descrição do Equipamento *
            </label>
            <input
              type="text"
              placeholder="Ex: Motoniveladora Caterpillar 140K"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              list="sugestoes-equipamentos"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
            <datalist id="sugestoes-equipamentos">
              {equipamentosSugeridos.map((eq, i) => (
                <option key={i} value={eq} />
              ))}
            </datalist>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantidade *
            </label>
            <input
              type="number"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden text-center font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Placa / Patrimônio
            </label>
            <input
              type="text"
              placeholder="Ex: PAT-401"
              value={placaPatrimonio}
              onChange={(e) => setPlacaPatrimonio(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Situação Operacional *
            </label>
            <select
              value={situacao}
              onChange={(e) => setSituacao(e.target.value as SituacaoEquipamento)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-semibold"
            >
              <option value="operacional">Operacional (Em atividade)</option>
              <option value="parcialmente_operacional">Parcialmente operacional</option>
              <option value="indisponivel">Indisponível (Manutenção)</option>
            </select>
          </div>

          <div className="sm:col-span-10">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações do Equipamento (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Substituição de lâmina pela manhã, operação normal à tarde..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAdicionar}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </div>
        </div>

        {/* Sugestões rápidas de 1 clique */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Adicionar rapidamente:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {equipamentosSugeridos.slice(0, 5).map((eq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDescricao(eq)}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
              >
                + {eq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela de Equipamentos Lançados */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
          Equipamentos Alocados na Obra ({rdo.equipamentos.length} itens)
        </div>

        {rdo.equipamentos.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhum equipamento registrado. Utilize o formulário acima para registrar as máquinas alocadas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Descrição do Equipamento</th>
                  <th className="px-4 py-2.5 text-center">Quantidade</th>
                  <th className="px-4 py-2.5">Placa / Patrimônio</th>
                  <th className="px-4 py-2.5">Situação</th>
                  <th className="px-4 py-2.5">Observações</th>
                  <th className="px-4 py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rdo.equipamentos.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{item.descricao}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) =>
                          handleAtualizar(item.id, 'quantidade', parseInt(e.target.value) || 1)
                        }
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-center font-bold"
                      />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">
                      <input
                        type="text"
                        placeholder="Patrimônio..."
                        value={item.placaPatrimonio || ''}
                        onChange={(e) => handleAtualizar(item.id, 'placaPatrimonio', e.target.value)}
                        className="w-28 rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={item.situacao}
                        onChange={(e) =>
                          handleAtualizar(item.id, 'situacao', e.target.value as SituacaoEquipamento)
                        }
                        className={`rounded px-2 py-1 font-semibold text-[11px] ${
                          item.situacao === 'operacional'
                            ? 'bg-emerald-50 text-emerald-800'
                            : item.situacao === 'parcialmente_operacional'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        <option value="operacional">Operacional</option>
                        <option value="parcialmente_operacional">Parcial</option>
                        <option value="indisponivel">Indisponível</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        placeholder="Observações..."
                        value={item.observacoes || ''}
                        onChange={(e) => handleAtualizar(item.id, 'observacoes', e.target.value)}
                        className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemover(item.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                        title="Remover equipamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
