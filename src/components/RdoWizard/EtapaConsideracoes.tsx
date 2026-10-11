import React from 'react';
import { Building, ShieldCheck, FileCheck2, Info } from 'lucide-react';
import type { Rdo } from '../../types';

interface EtapaConsideracoesProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
}

export const EtapaConsideracoes: React.FC<EtapaConsideracoesProps> = ({ rdo, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Alerta explicativo */}
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <Info className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-slate-900">
            Considerações Formais das Partes (Norma DNIT 097/2025 – Anexo A)
          </div>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            Os campos abaixo são formalmente independentes e não exigem preenchimento simultâneo ou presunção de aprovação automática. Cada interveniente registra suas manifestações técnicas conforme suas atribuições.
          </p>
        </div>
      </div>

      {/* 1. Considerações da Construtora (Executora) */}
      <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
          <Building className="h-5 w-5 text-blue-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Considerações da Empresa Executora (Construtora)
            </h3>
            <p className="text-[11px] text-slate-500">
              Explicações sobre restrições, medidas corretivas, prazos, notas de serviço, jazidas e faixa de domínio
            </p>
          </div>
        </div>

        <textarea
          rows={4}
          placeholder="A Construtora registra que..."
          value={rdo.consideracoesConstrutora || ''}
          onChange={(e) => onChange({ consideracoesConstrutora: e.target.value })}
          className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-blue-500 focus:outline-hidden"
        />
      </div>

      {/* 2. Considerações da Supervisora */}
      <div className="rounded-xl border border-indigo-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
          <ShieldCheck className="h-5 w-5 text-indigo-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Considerações da Empresa Supervisora / Gerenciadora
            </h3>
            <p className="text-[11px] text-slate-500">
              Análise do cumprimento das obrigações contratuais, suficiência de pessoal e equipamentos, qualidade e cronograma
            </p>
          </div>
        </div>

        <textarea
          rows={4}
          placeholder="A Supervisora atesta e observa que..."
          value={rdo.consideracoesSupervisora || ''}
          onChange={(e) => onChange({ consideracoesSupervisora: e.target.value })}
          className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-blue-500 focus:outline-hidden"
        />
      </div>

      {/* 3. Considerações da Fiscalização do DNIT */}
      <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
          <FileCheck2 className="h-5 w-5 text-emerald-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Considerações da Fiscalização do DNIT
            </h3>
            <p className="text-[11px] text-slate-500">
              Validade ou ressalvas aos lançamentos, juízo sobre o andamento da obra, soluções às consultas e determinações
            </p>
          </div>
        </div>

        <textarea
          rows={4}
          placeholder="A Fiscalização do DNIT determina e toma ciência de que..."
          value={rdo.consideracoesFiscalizacao || ''}
          onChange={(e) => onChange({ consideracoesFiscalizacao: e.target.value })}
          className="w-full rounded-lg border border-slate-300 p-3 text-xs leading-relaxed focus:border-blue-500 focus:outline-hidden"
        />
      </div>
    </div>
  );
};
