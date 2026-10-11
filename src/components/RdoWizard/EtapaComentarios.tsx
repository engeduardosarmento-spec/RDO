import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, FileCheck, Building, ShieldCheck, User } from 'lucide-react';
import type { Rdo, OrigemComentario, TipoComentario, ComentarioItem, OrdemServicoItem } from '../../types';

interface EtapaComentariosProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
}

const origens: OrigemComentario[] = ['Construtora', 'Supervisora', 'Fiscalização DNIT'];

const tiposComentario: TipoComentario[] = [
  'Registro de atividade',
  'Observação técnica',
  'Ocorrência',
  'Não conformidade',
  'Solicitação de providência',
  'Resposta ou esclarecimento',
  'Determinação da fiscalização',
  'Outros',
];

export const EtapaComentarios: React.FC<EtapaComentariosProps> = ({ rdo, onChange }) => {
  // Comentários form state
  const [origem, setOrigem] = useState<OrigemComentario>('Construtora');
  const [autor, setAutor] = useState('');
  const [dataHora, setDataHora] = useState(
    `${rdo.data || new Date().toISOString().split('T')[0]} 17:00`
  );
  const [tipo, setTipo] = useState<TipoComentario>('Registro de atividade');
  const [texto, setTexto] = useState('');

  // Ordem de Serviço form state (Fiscalização)
  const [numeroOs, setNumeroOs] = useState('');
  const [segmentoOs, setSegmentoOs] = useState('');
  const [naturezaOs, setNaturezaOs] = useState('');
  const [obsOs, setObsOs] = useState('');

  const handleAdicionarComentario = () => {
    if (!texto.trim() || !autor.trim()) return;

    const novoComentario: ComentarioItem = {
      id: `com-${Date.now()}`,
      origem,
      autor: autor.trim(),
      dataHora,
      tipo,
      texto: texto.trim(),
    };

    onChange({
      comentarios: [...rdo.comentarios, novoComentario],
    });

    setTexto('');
  };

  const handleRemoverComentario = (id: string) => {
    onChange({
      comentarios: rdo.comentarios.filter((c) => c.id !== id),
    });
  };

  const handleAdicionarOs = () => {
    if (!numeroOs.trim() || !naturezaOs.trim()) return;

    const novaOs: OrdemServicoItem = {
      id: `os-${Date.now()}`,
      numero: numeroOs.trim(),
      segmento: segmentoOs.trim() || 'Trecho contratual',
      naturezaServico: naturezaOs.trim(),
      observacoes: obsOs.trim() || undefined,
    };

    onChange({
      ordensServico: [...(rdo.ordensServico || []), novaOs],
    });

    setNumeroOs('');
    setSegmentoOs('');
    setNaturezaOs('');
    setObsOs('');
  };

  const handleRemoverOs = (id: string) => {
    onChange({
      ordensServico: (rdo.ordensServico || []).filter((o) => o.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Bloco 1: Novo Comentário */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-800">
          <MessageSquare className="h-4 w-4 text-sky-700" />
          <span>Registrar Comentário / Observação Técnica</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Origem do Comentário *
            </label>
            <select
              value={origem}
              onChange={(e) => setOrigem(e.target.value as OrigemComentario)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-hidden"
            >
              {origens.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome Completo do Autor *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Eng. Responsável ou Fiscal"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipo de Comentário *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoComentario)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
            >
              {tiposComentario.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Texto do Comentário / Esclarecimento *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Inserir notas sobre avanço físico, consultas, esclarecimentos ou determinações..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="button"
              onClick={handleAdicionarComentario}
              className="flex items-center gap-1.5 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Adicionar Comentário
            </button>
          </div>
        </div>
      </div>

      {/* Bloco 2: Lista de Comentários Registrados */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">
          Comentários Registrados no RDO ({rdo.comentarios.length})
        </div>

        {rdo.comentarios.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhum comentário lançado. Adicione notas ou apontamentos nos campos acima.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rdo.comentarios.map((c) => {
              const corOrigem =
                c.origem === 'Construtora'
                  ? 'bg-blue-100 text-blue-800'
                  : c.origem === 'Supervisora'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-emerald-100 text-emerald-800';

              return (
                <div key={c.id} className="p-4 hover:bg-slate-50/60 transition flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${corOrigem}`}>
                        {c.origem.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{c.autor}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {c.tipo}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{c.dataHora}</span>
                    </div>

                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {c.texto}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoverComentario(c.id)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    title="Remover comentário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bloco 3: Ordens de Serviço Vinculadas (Fiscalização do DNIT) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-800">
          <FileCheck className="h-4 w-4 text-emerald-700" />
          <span>Ordens de Serviço Relacionadas (Fiscalização do DNIT)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número da OS *
            </label>
            <input
              type="text"
              placeholder="Ex: OS nº 042/2026-DNIT"
              value={numeroOs}
              onChange={(e) => setNumeroOs(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Segmento Localizado
            </label>
            <input
              type="text"
              placeholder="Ex: km 272,000 ao km 275,000"
              value={segmentoOs}
              onChange={(e) => setSegmentoOs(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Natureza do Serviço *
            </label>
            <input
              type="text"
              placeholder="Ex: Recomposição de base e cascalhamento"
              value={naturezaOs}
              onChange={(e) => setNaturezaOs(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleAdicionarOs}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Vincular OS
            </button>
          </div>
        </div>

        {/* Lista de Ordens de Serviço */}
        {rdo.ordensServico && rdo.ordensServico.length > 0 && (
          <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {rdo.ordensServico.map((os) => (
              <div key={os.id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">{os.numero}</span> •{' '}
                  <span className="text-slate-600">Segmento: {os.segmento}</span> •{' '}
                  <span className="text-slate-600">Natureza: {os.naturezaServico}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoverOs(os.id)}
                  className="text-red-500 hover:text-red-700"
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
