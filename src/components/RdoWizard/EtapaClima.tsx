import React from 'react';
import { Sun, CloudRain, AlertTriangle, CloudSun } from 'lucide-react';
import type { Rdo, CondicaoMeteorologica, CondicaoTrabalho } from '../../types';

interface EtapaClimaProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
}

const condicoesTempo: CondicaoMeteorologica[] = [
  'Bom',
  'Nublado',
  'Chuva leve',
  'Chuva intensa',
  'Instável',
  'Outro',
];

const condicoesTrabalho: CondicaoTrabalho[] = ['Praticável', 'Impraticável'];

export const EtapaClima: React.FC<EtapaClimaProps> = ({ rdo, onChange }) => {
  const handleClimaManha = (campo: string, valor: any) => {
    onChange({
      climaManha: {
        ...rdo.climaManha,
        [campo]: valor,
      },
    });
  };

  const handleClimaTarde = (campo: string, valor: any) => {
    onChange({
      climaTarde: {
        ...rdo.climaTarde,
        [campo]: valor,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Alerta explicativo */}
      <div className="rounded-xl bg-blue-50/70 p-4 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
        <Sun className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Norma DNIT 097/2025 — Independência dos Lançamentos Climáticos</div>
          <p className="mt-0.5 text-blue-800 leading-relaxed">
            A condição meteorológica e a condição de trabalho são lançadas de forma estritamente independente. Mesmo sob chuva leve o trabalho pode ser praticável para determinados serviços, assim como com tempo bom o solo pode estar saturado e impraticável.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PERÍODO DA MANHÃ */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Período da Manhã
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              07:00 às 12:00
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Condição Meteorológica (Tempo) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {condicoesTempo.map((tempo) => {
                const selecionado = rdo.climaManha.condicaoTempo === tempo;
                return (
                  <button
                    key={tempo}
                    type="button"
                    onClick={() => handleClimaManha('condicaoTempo', tempo)}
                    className={`rounded-lg py-2 px-2 text-xs font-semibold transition border text-center ${
                      selecionado
                        ? 'border-sky-600 bg-sky-50 text-sky-800 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {tempo}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Condição de Trabalho na Manhã *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {condicoesTrabalho.map((ct) => {
                const selecionado = rdo.climaManha.condicaoTrabalho === ct;
                const isPrat = ct === 'Praticável';
                return (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => handleClimaManha('condicaoTrabalho', ct)}
                    className={`rounded-xl py-2.5 px-3 text-xs font-bold transition border text-center ${
                      selecionado
                        ? isPrat
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                          : 'border-red-500 bg-red-50 text-red-800 shadow-xs ring-1 ring-red-500'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {ct}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Complementares da Manhã
            </label>
            <input
              type="text"
              placeholder="Ex: Tempo seco, início às 07h..."
              value={rdo.climaManha.observacoes || ''}
              onChange={(e) => handleClimaManha('observacoes', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* PERÍODO DA TARDE */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Período da Tarde
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
              13:00 às 18:00
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Condição Meteorológica (Tempo) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {condicoesTempo.map((tempo) => {
                const selecionado = rdo.climaTarde.condicaoTempo === tempo;
                return (
                  <button
                    key={tempo}
                    type="button"
                    onClick={() => handleClimaTarde('condicaoTempo', tempo)}
                    className={`rounded-lg py-2 px-2 text-xs font-semibold transition border text-center ${
                      selecionado
                        ? 'border-sky-600 bg-sky-50 text-sky-800 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {tempo}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Condição de Trabalho na Tarde *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {condicoesTrabalho.map((ct) => {
                const selecionado = rdo.climaTarde.condicaoTrabalho === ct;
                const isPrat = ct === 'Praticável';
                return (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => handleClimaTarde('condicaoTrabalho', ct)}
                    className={`rounded-xl py-2.5 px-3 text-xs font-bold transition border text-center ${
                      selecionado
                        ? isPrat
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs ring-1 ring-emerald-500'
                          : 'border-red-500 bg-red-50 text-red-800 shadow-xs ring-1 ring-red-500'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {ct}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Complementares da Tarde
            </label>
            <input
              type="text"
              placeholder="Ex: Céu limpo, boa temperatura de compactação..."
              value={rdo.climaTarde.observacoes || ''}
              onChange={(e) => handleClimaTarde('observacoes', e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Ocorrências meteorológicas gerais */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Ocorrências Meteorológicas Relevantes / Paralisações por Chuva
        </label>
        <textarea
          rows={2}
          placeholder="Ex: Precipitação pluviométrica torrencial das 14h às 15h30, inviabilizando compactação no trecho..."
          value={rdo.ocorrenciasMeteorologicas || ''}
          onChange={(e) => onChange({ ocorrenciasMeteorologicas: e.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
        />
      </div>
    </div>
  );
};
