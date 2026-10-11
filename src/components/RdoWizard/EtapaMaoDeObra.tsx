import React, { useState } from 'react';
import { Users, Plus, Trash2, Copy, Check, UserCheck, ShieldCheck } from 'lucide-react';
import type { Rdo, MaoDeObraItem } from '../../types';

interface EtapaMaoDeObraProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
  rdosAnteriores: Rdo[];
}

const funcoesComuns: Array<{ funcao: string; categoria: 'direta' | 'indireta' }> = [
  { funcao: 'Operador de Motoniveladora', categoria: 'direta' },
  { funcao: 'Operador de Rolo Compactador', categoria: 'direta' },
  { funcao: 'Motorista de Caminhão Pipa', categoria: 'direta' },
  { funcao: 'Motorista de Basculante', categoria: 'direta' },
  { funcao: 'Operador de Pá Carregadeira', categoria: 'direta' },
  { funcao: 'Operador de Retroescavadeira', categoria: 'direta' },
  { funcao: 'Rasteleiro / Servente de Pista', categoria: 'direta' },
  { funcao: 'Sinalizador de Tráfego / Bandeirinha', categoria: 'direta' },
  { funcao: 'Topógrafo / Nivelador', categoria: 'indireta' },
  { funcao: 'Laboratorista / Auxiliar de Solos', categoria: 'indireta' },
  { funcao: 'Técnico de Segurança do Trabalho (TST)', categoria: 'indireta' },
  { funcao: 'Mecânico de Campo', categoria: 'indireta' },
];

export const EtapaMaoDeObra: React.FC<EtapaMaoDeObraProps> = ({
  rdo,
  onChange,
  rdosAnteriores,
}) => {
  const [funcaoRapida, setFuncaoRapida] = useState('');
  const [qtdRapida, setQtdRapida] = useState<number>(1);
  const [categoriaRapida, setCategoriaRapida] = useState<'direta' | 'indireta'>('direta');

  const totalDireta = rdo.maoDeObra
    .filter((m) => m.categoria === 'direta')
    .reduce((acc, cur) => acc + (cur.quantidade || 0), 0);

  const totalIndireta = rdo.maoDeObra
    .filter((m) => m.categoria === 'indireta')
    .reduce((acc, cur) => acc + (cur.quantidade || 0), 0);

  const totalGeral = totalDireta + totalIndireta;

  const handleAdicionarItem = () => {
    if (!funcaoRapida.trim() || qtdRapida <= 0) return;

    const novoItem: MaoDeObraItem = {
      id: `mo-${Date.now()}`,
      funcao: funcaoRapida.trim(),
      quantidade: qtdRapida,
      categoria: categoriaRapida,
    };

    onChange({
      maoDeObra: [...rdo.maoDeObra, novoItem],
    });

    setFuncaoRapida('');
    setQtdRapida(1);
  };

  const handleRemoverItem = (id: string) => {
    onChange({
      maoDeObra: rdo.maoDeObra.filter((m) => m.id !== id),
    });
  };

  const handleAtualizarItem = (id: string, campo: keyof MaoDeObraItem, valor: any) => {
    onChange({
      maoDeObra: rdo.maoDeObra.map((m) => (m.id === id ? { ...m, [campo]: valor } : m)),
    });
  };

  const reaproveitarEquipeRdoAnterior = () => {
    const rdoComEquipe = rdosAnteriores.find((r) => r.id !== rdo.id && r.maoDeObra.length > 0);
    if (!rdoComEquipe) return;

    onChange({
      apontador: rdoComEquipe.apontador || rdo.apontador,
      encarregado: rdoComEquipe.encarregado || rdo.encarregado,
      outrosResponsaveis: rdoComEquipe.outrosResponsaveis || rdo.outrosResponsaveis,
      maoDeObra: rdoComEquipe.maoDeObra.map((m) => ({
        ...m,
        id: `mo-${Date.now()}-${Math.random()}`,
      })),
    });
  };

  return (
    <div className="space-y-6">
      {/* Bloco 1: Responsáveis Diretos de Campo (Apontador / Encarregado) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <UserCheck className="h-4 w-4 text-sky-700" />
            <span>Responsáveis de Campo</span>
          </div>
          {rdosAnteriores.length > 0 && (
            <button
              type="button"
              onClick={reaproveitarEquipeRdoAnterior}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 px-2.5 py-1 rounded-lg"
            >
              <Copy className="h-3.5 w-3.5" />
              Reaproveitar do RDO Anterior
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apontador de Obra *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Otávio Júnior"
              value={rdo.apontador}
              onChange={(e) => onChange({ apontador: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Encarregado Geral de Campo *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Deocleciano Gonçalves"
              value={rdo.encarregado}
              onChange={(e) => onChange({ encarregado: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Outros Responsáveis / Técnicos
            </label>
            <input
              type="text"
              placeholder="Ex: TST: Marcelo / Topógrafo: Carlos"
              value={rdo.outrosResponsaveis || ''}
              onChange={(e) => onChange({ outrosResponsaveis: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Bloco 2: Totais Calculados de Mão de Obra */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
            Mão de Obra Direta
          </span>
          <div className="mt-1 text-2xl font-bold text-sky-950">{totalDireta}</div>
          <span className="text-[10px] text-sky-600">Produção na pista / campo</span>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
            Mão de Obra Indireta
          </span>
          <div className="mt-1 text-2xl font-bold text-indigo-950">{totalIndireta}</div>
          <span className="text-[10px] text-indigo-600">Apoio, controle e gestão</span>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Efetivo Geral Total
          </span>
          <div className="mt-1 text-2xl font-bold text-emerald-950">{totalGeral}</div>
          <span className="text-[10px] text-emerald-600">Total de trabalhadores ativos</span>
        </div>
      </div>

      {/* Bloco 3: Formulário de Adicionar Função */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Adicionar Função ao Efetivo
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Função / Cargo
            </label>
            <input
              type="text"
              placeholder="Ex: Operador de Motoniveladora"
              value={funcaoRapida}
              onChange={(e) => setFuncaoRapida(e.target.value)}
              list="sugestoes-funcoes"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
            <datalist id="sugestoes-funcoes">
              {funcoesComuns.map((f, i) => (
                <option key={i} value={f.funcao} />
              ))}
            </datalist>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantidade
            </label>
            <input
              type="number"
              min={1}
              value={qtdRapida}
              onChange={(e) => setQtdRapida(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden text-center font-bold"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Categoria
            </label>
            <select
              value={categoriaRapida}
              onChange={(e) => setCategoriaRapida(e.target.value as 'direta' | 'indireta')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-medium"
            >
              <option value="direta">Direta (Produção)</option>
              <option value="indireta">Indireta (Apoio)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAdicionarItem}
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
            Sugestões frequentes:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {funcoesComuns.slice(0, 6).map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setFuncaoRapida(f.funcao);
                  setCategoriaRapida(f.categoria);
                }}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
              >
                + {f.funcao}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bloco 4: Tabela de Itens de Mão de Obra Lançados */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
          Efetivo de Campo Lançado no Período ({rdo.maoDeObra.length} funções)
        </div>

        {rdo.maoDeObra.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhuma função de mão de obra adicionada ainda. Preencha os campos acima para registrar o efetivo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Função / Cargo</th>
                  <th className="px-4 py-2.5 text-center">Quantidade</th>
                  <th className="px-4 py-2.5">Categoria</th>
                  <th className="px-4 py-2.5">Observações</th>
                  <th className="px-4 py-2.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rdo.maoDeObra.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{item.funcao}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) =>
                          handleAtualizarItem(item.id, 'quantidade', parseInt(e.target.value) || 1)
                        }
                        className="w-16 rounded border border-slate-300 px-2 py-1 text-center font-bold"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={item.categoria}
                        onChange={(e) =>
                          handleAtualizarItem(item.id, 'categoria', e.target.value as 'direta' | 'indireta')
                        }
                        className={`rounded px-2 py-1 font-semibold text-[11px] ${
                          item.categoria === 'direta'
                            ? 'bg-sky-50 text-sky-800'
                            : 'bg-indigo-50 text-indigo-800'
                        }`}
                      >
                        <option value="direta">Direta</option>
                        <option value="indireta">Indireta</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        placeholder="Observações..."
                        value={item.observacoes || ''}
                        onChange={(e) => handleAtualizarItem(item.id, 'observacoes', e.target.value)}
                        className="w-full rounded border border-slate-200 px-2 py-1 text-xs"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoverItem(item.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                        title="Remover função"
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
