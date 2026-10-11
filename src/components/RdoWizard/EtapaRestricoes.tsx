import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, Plus, Trash2, ShieldAlert, Clock, Check } from 'lucide-react';
import type { Rdo, CategoriaRestricao, EventoRestricaoItem, SituacaoOcorrencia } from '../../types';

interface EtapaRestricoesProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
}

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

export const EtapaRestricoes: React.FC<EtapaRestricoesProps> = ({ rdo, onChange }) => {
  const [categoria, setCategoria] = useState<CategoriaRestricao>('Equipamentos');
  const [descricao, setDescricao] = useState('');
  const [dataHora, setDataHora] = useState(
    `${rdo.data || new Date().toISOString().split('T')[0]} 10:00`
  );
  const [segmento, setSegmento] = useState('');
  const [responsavel, setResponsavel] = useState('Encarregado Geral');
  const [providencia, setProvidencia] = useState('');
  const [prazoSolucao, setPrazoSolucao] = useState('');
  const [situacao, setSituacao] = useState<SituacaoOcorrencia>('em_tratamento');
  const [observacoes, setObservacoes] = useState('');

  const toggleSemRestricoes = (semRestricoes: boolean) => {
    if (semRestricoes) {
      // Zera restrições
      const categoriasZeradas: Record<CategoriaRestricao, boolean> = {
        Pessoal: false,
        Equipamentos: false,
        Instalações: false,
        'Cronograma físico': false,
        Qualidade: false,
        'Atendimento à fiscalização': false,
        'Administração da obra': false,
        'Meio ambiente': false,
      };
      onChange({
        semRestricoes: true,
        restricoesCategorias: categoriasZeradas,
        eventosRestricoes: [],
      });
    } else {
      onChange({ semRestricoes: false });
    }
  };

  const toggleCategoriaR = (cat: CategoriaRestricao) => {
    const atual = rdo.restricoesCategorias?.[cat] || false;
    const novasCategorias = {
      ...rdo.restricoesCategorias,
      [cat]: !atual,
    };
    onChange({
      restricoesCategorias: novasCategorias,
      semRestricoes: false,
    });
  };

  const handleAdicionarEvento = () => {
    if (!descricao.trim()) return;

    const novoEvento: EventoRestricaoItem = {
      id: `ev-${Date.now()}`,
      categoria,
      descricao: descricao.trim(),
      dataHora,
      segmento: segmento.trim() || undefined,
      responsavel: responsavel.trim() || 'Equipe técnica',
      providencia: providencia.trim() || 'Em análise',
      prazoSolucao: prazoSolucao.trim() || undefined,
      situacao,
      observacoes: observacoes.trim() || undefined,
    };

    // Marca a categoria com "R" automaticamente se ainda não estava
    const novasCategorias = {
      ...rdo.restricoesCategorias,
      [categoria]: true,
    };

    onChange({
      semRestricoes: false,
      restricoesCategorias: novasCategorias,
      eventosRestricoes: [...rdo.eventosRestricoes, novoEvento],
    });

    setDescricao('');
    setProvidencia('');
    setSegmento('');
    setPrazoSolucao('');
    setObservacoes('');
  };

  const handleRemoverEvento = (id: string) => {
    const eventosRestantes = rdo.eventosRestricoes.filter((e) => e.id !== id);
    // Recalcula quais categorias ainda têm eventos
    const novasCategorias: Record<string, boolean> = { ...rdo.restricoesCategorias };
    categoriasOficiais.forEach((cat) => {
      novasCategorias[cat] = eventosRestantes.some((e) => e.categoria === cat);
    });

    onChange({
      eventosRestricoes: eventosRestantes,
      restricoesCategorias: novasCategorias as Record<CategoriaRestricao, boolean>,
      semRestricoes: eventosRestantes.length === 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Bloco 1: Declaração de Inexistência de Restrições */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Declaração de Inexistência de Restrições
            </h3>
            <p className="text-xs text-slate-500">
              Conforme Anexo B da Norma DNIT 097/2025 – PRO, é permitido declarar expressamente a ausência de restrições
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleSemRestricoes(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                rdo.semRestricoes && rdo.eventosRestricoes.length === 0
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Sem restrições no período
            </button>

            <button
              type="button"
              onClick={() => toggleSemRestricoes(false)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                !rdo.semRestricoes || rdo.eventosRestricoes.length > 0
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertOctagon className="h-4 w-4" />
              Houve restrições
            </button>
          </div>
        </div>
      </div>

      {/* Bloco 2: Painel de Categorias com Marcação "R" */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Categorias Avaliadas (Marcar &ldquo;R&rdquo; onde houver restrição)
          </div>
          <span className="text-[11px] text-slate-400">
            Norma DNIT 097/2025 – Anexo A
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categoriasOficiais.map((cat) => {
            const marcada = rdo.restricoesCategorias?.[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategoriaR(cat)}
                className={`flex items-center justify-between rounded-xl p-3 text-left transition border ${
                  marcada
                    ? 'border-amber-400 bg-amber-50 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs truncate">{cat}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                    marcada
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {marcada ? 'R' : '-'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloco 3: Formulário de Adicionar Evento com Restrição */}
      {!rdo.semRestricoes && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-800">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>Cadastrar Ocorrência / Restrição Técnica</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria da Ocorrência *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaRestricao)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-hidden"
              >
                {categoriasOficiais.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data e Horário *
              </label>
              <input
                type="text"
                placeholder="AAAA-MM-DD HH:mm"
                value={dataHora}
                onChange={(e) => setDataHora(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Segmento / Estaca Envolvido
              </label>
              <input
                type="text"
                placeholder="Ex: km 272,800 ou Faixa de Domínio"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-12">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição Objetiva da Ocorrência *
              </label>
              <textarea
                rows={2}
                placeholder="Descrever objetivamente o fato ocorrido (falha mecânica, atraso de insumo, interferência climática, etc.)..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Parte Envolvida / Responsável
              </label>
              <input
                type="text"
                placeholder="Ex: Executora (Encarregado Mecânico)"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Providência Adotada ou Necessária *
              </label>
              <input
                type="text"
                placeholder="Ex: Acionada oficina móvel para substituição da mangueira..."
                value={providencia}
                onChange={(e) => setProvidencia(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Situação do Evento *
              </label>
              <select
                value={situacao}
                onChange={(e) => setSituacao(e.target.value as SituacaoOcorrencia)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-hidden"
              >
                <option value="aberto">Aberto (Pendente)</option>
                <option value="em_tratamento">Em tratamento</option>
                <option value="resolvido">Resolvido</option>
              </select>
            </div>

            <div className="sm:col-span-12 flex justify-end">
              <button
                type="button"
                onClick={handleAdicionarEvento}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Registrar Evento com Restrição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bloco 4: Lista dos Eventos Registrados */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
          Eventos com Restrições Lançados ({rdo.eventosRestricoes.length})
        </div>

        {rdo.semRestricoes || rdo.eventosRestricoes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <div className="font-bold text-slate-700">Sem restrições registradas no período.</div>
            <p className="mt-0.5 text-slate-400">
              O relatório será emitido com a declaração formal de inexistência de restrições.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rdo.eventosRestricoes.map((ev, index) => (
              <div key={ev.id} className="p-4 hover:bg-slate-50/60 transition flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                      [{ev.categoria}]
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{ev.dataHora}</span>
                    {ev.segmento && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {ev.segmento}
                      </span>
                    )}
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        ev.situacao === 'resolvido'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.situacao === 'em_tratamento'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ev.situacao.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-800">{ev.descricao}</p>

                  <div className="text-[11px] text-slate-600">
                    <strong>Providência:</strong> {ev.providencia} • <strong>Responsável:</strong> {ev.responsavel}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoverEvento(ev.id)}
                  className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                  title="Remover evento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
