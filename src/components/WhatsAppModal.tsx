import React, { useState, useEffect } from 'react';
import { X, Copy, Check, MessageSquare, Share2, Edit3 } from 'lucide-react';
import { abrirWhatsAppComTexto, compartilharViaWebShare } from '../utils/whatsappGenerator';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  textoInicial: string;
  rdoNumero: number;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  textoInicial,
  rdoNumero,
}) => {
  const [texto, setTexto] = useState(textoInicial);
  const [copiado, setCopiado] = useState(false);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    setTexto(textoInicial);
    setCopiado(false);
    setEditando(false);
  }, [textoInicial, isOpen]);

  if (!isOpen) return null;

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      // Fallback para seleção manual
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  const handleCompartilhar = async () => {
    const compartilhado = await compartilharViaWebShare(`RDO nº ${rdoNumero} - DNIT`, texto);
    if (!compartilhado) {
      abrirWhatsAppComTexto(texto);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Resumo para WhatsApp</h3>
              <p className="text-xs text-slate-500">RDO nº {rdoNumero} — Norma DNIT 097/2025 – PRO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {editando ? 'Editando mensagem' : 'Pré-visualização do texto'}
            </span>
            <button
              onClick={() => setEditando(!editando)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              <Edit3 className="h-3.5 w-3.5" />
              {editando ? 'Finalizar edição' : 'Editar texto antes de compartilhar'}
            </button>
          </div>

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={!editando}
            rows={14}
            className={`w-full rounded-lg font-mono text-xs leading-relaxed p-3.5 border transition ${
              editando
                ? 'border-blue-400 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20'
                : 'border-slate-200 bg-slate-50 text-slate-700 cursor-default'
            }`}
          />

          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200/60">
            <strong>Aviso:</strong> O aplicativo prepara o resumo técnico formatado e permite copiar ou abrir o WhatsApp. Ele não confirma o envio automático da mensagem.
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopiar}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition shadow-xs ${
                copiado
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {copiado ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiado ? 'Texto Copiado!' : 'Copiar Texto'}
            </button>

            <button
              onClick={handleCompartilhar}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
