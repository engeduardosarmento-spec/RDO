import React, { useState } from 'react';
import { Users, Truck, Plus, Trash2, Save, HardDrive } from 'lucide-react';
import type { EquipePredefinida, EquipamentoPredefinido, Contrato } from '../types';

interface ProfissionaisEquipesProps {
  contratos: Contrato[];
  equipes: EquipePredefinida[];
  equipamentos: EquipamentoPredefinido[];
  onSalvarEquipe: (equipe: EquipePredefinida) => Promise<void>;
  onExcluirEquipe: (id: string) => Promise<void>;
  onSalvarEquipamento: (equip: EquipamentoPredefinido) => Promise<void>;
  onExcluirEquipamento: (id: string) => Promise<void>;
}

export const ProfissionaisEquipes: React.FC<ProfissionaisEquipesProps> = ({
  contratos,
  equipes,
  equipamentos,
  onSalvarEquipe,
  onExcluirEquipe,
  onSalvarEquipamento,
  onExcluirEquipamento,
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'equipes' | 'equipamentos'>('equipes');

  // Form de Equipe
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [apontador, setApontador] = useState('');
  const [encarregado, setEncarregado] = useState('');

  // Form de Equipamento
  const [descEquip, setDescEquip] = useState('');
  const [placaEquip, setPlacaEquip] = useState('');
  const [qtdEquip, setQtdEquip] = useState(1);

  const handleCadastrarEquipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeEquipe.trim() || !encarregado.trim()) return;

    const nova: EquipePredefinida = {
      id: `eqp-${Date.now()}`,
      nome: nomeEquipe.trim(),
      apontador: apontador.trim(),
      encarregado: encarregado.trim(),
      itens: [],
    };

    await onSalvarEquipe(nova);
    setNomeEquipe('');
    setApontador('');
    setEncarregado('');
  };

  const handleCadastrarEquipamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descEquip.trim()) return;

    const novo: EquipamentoPredefinido = {
      id: `eqm-${Date.now()}`,
      descricao: descEquip.trim(),
      placaPatrimonio: placaEquip.trim() || undefined,
      quantidadePadrao: qtdEquip,
    };

    await onSalvarEquipamento(novo);
    setDescEquip('');
    setPlacaEquip('');
    setQtdEquip(1);
  };

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setAbaAtiva('equipes')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition ${
            abaAtiva === 'equipes'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          Equipes Pré-cadastradas
        </button>
        <button
          onClick={() => setAbaAtiva('equipamentos')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-bold transition ${
            abaAtiva === 'equipamentos'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="h-4 w-4" />
          Frota e Equipamentos Frequentes
        </button>
      </div>

      {abaAtiva === 'equipes' && (
        <div className="space-y-6">
          {/* Cadastro de Equipe */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Cadastrar Modelo de Equipe de Campo
            </h3>

            <form onSubmit={handleCadastrarEquipe} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Equipe *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Equipe de Terraplenagem"
                  value={nomeEquipe}
                  onChange={(e) => setNomeEquipe(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Apontador Padrão
                </label>
                <input
                  type="text"
                  placeholder="Ex: Otávio Júnior"
                  value={apontador}
                  onChange={(e) => setApontador(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Encarregado Geral *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Deocleciano Gonçalves"
                  value={encarregado}
                  onChange={(e) => setEncarregado(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Salvar Equipe
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Equipes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipes.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                Nenhum modelo de equipe salvo ainda.
              </div>
            ) : (
              equipes.map((eq) => (
                <div key={eq.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{eq.nome}</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      <strong>Encarregado:</strong> {eq.encarregado}
                    </p>
                    {eq.apontador && (
                      <p className="text-xs text-slate-500">
                        <strong>Apontador:</strong> {eq.apontador}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onExcluirEquipe(eq.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {abaAtiva === 'equipamentos' && (
        <div className="space-y-6">
          {/* Cadastro de Maquinário */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Cadastrar Equipamento / Veículo Frequente
            </h3>

            <form onSubmit={handleCadastrarEquipamento} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição do Equipamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Motoniveladora CAT 140K"
                  value={descEquip}
                  onChange={(e) => setDescEquip(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Placa / Patrimônio Típico
                </label>
                <input
                  type="text"
                  placeholder="Ex: PAT-401"
                  value={placaEquip}
                  onChange={(e) => setPlacaEquip(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade Padrão
                </label>
                <input
                  type="number"
                  min={1}
                  value={qtdEquip}
                  onChange={(e) => setQtdEquip(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Salvar Equipamento
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Equipamentos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {equipamentos.length === 0 ? (
              <div className="col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                Nenhum equipamento pré-cadastrado.
              </div>
            ) : (
              equipamentos.map((eq) => (
                <div key={eq.id} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{eq.descricao}</h5>
                    {eq.placaPatrimonio && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {eq.placaPatrimonio}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onExcluirEquipamento(eq.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
