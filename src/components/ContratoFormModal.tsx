import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, MapPin, Calendar, Users, AlertCircle } from 'lucide-react';
import type { Contrato } from '../types';
import { SERVICOS_PADRAO_DNIT, db } from '../db/database';

interface ContratoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contratoEmEdicao?: Contrato | null;
  onSalvar: (contrato: Contrato) => Promise<void>;
}

export const ContratoFormModal: React.FC<ContratoFormModalProps> = ({
  isOpen,
  onClose,
  contratoEmEdicao,
  onSalvar,
}) => {
  const [formData, setFormData] = useState<Partial<Contrato>>({
    numeroContrato: '',
    processoSei: '',
    contratante: 'DNIT - Departamento Nacional de Infraestrutura de Transportes',
    superintendenciaRegional: '',
    unidadeLocal: '',
    empresaExecutora: '',
    cnpjExecutora: '',
    empresaSupervisora: '',
    cnpjSupervisora: '',
    responsavelTecnicoExecutora: '',
    emailResponsavelExecutora: '',
    artCreaExecutora: '',
    responsavelTecnicoSupervisora: '',
    emailResponsavelSupervisora: '',
    artCreaSupervisora: '',
    fiscalDnit: '',
    emailFiscalDnit: '',
    portariaFiscal: '',

    nomeObra: '',
    tipoEmpreendimento: 'Restauração e Manutenção Rodoviária',
    rodovia: '',
    uf: '',
    trecho: '',
    subtrecho: '',
    segmentoInicialKm: 0,
    segmentoFinalKm: 0,
    extensaoContratualKm: 0,
    prazoContratualDias: 365,
    dataInicio: new Date().toISOString().split('T')[0],
    dataPrevisaoConclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observacoes: '',
    ativo: true,
  });

  const [incluirServicosPadrao, setIncluirServicosPadrao] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (contratoEmEdicao) {
      setFormData(contratoEmEdicao);
      setIncluirServicosPadrao(false);
    } else {
      setFormData({
        id: `contrato-${Date.now()}`,
        numeroContrato: '',
        processoSei: '',
        contratante: 'DNIT - Departamento Nacional de Infraestrutura de Transportes',
        superintendenciaRegional: '',
        unidadeLocal: '',
        empresaExecutora: '',
        cnpjExecutora: '',
        empresaSupervisora: '',
        cnpjSupervisora: '',
        responsavelTecnicoExecutora: '',
        emailResponsavelExecutora: '',
        artCreaExecutora: '',
        responsavelTecnicoSupervisora: '',
        emailResponsavelSupervisora: '',
        artCreaSupervisora: '',
        fiscalDnit: '',
        emailFiscalDnit: '',
        portariaFiscal: '',

        nomeObra: '',
        tipoEmpreendimento: 'Restauração e Manutenção Rodoviária',
        rodovia: '',
        uf: '',
        trecho: '',
        subtrecho: '',
        segmentoInicialKm: 0,
        segmentoFinalKm: 0,
        extensaoContratualKm: 0,
        prazoContratualDias: 365,
        dataInicio: new Date().toISOString().split('T')[0],
        dataPrevisaoConclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        observacoes: '',
        ativo: true,
      });
      setIncluirServicosPadrao(true);
    }
    setErro(null);
  }, [contratoEmEdicao, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const num = parseFloat(value);
      setFormData((prev) => {
        const next = { ...prev, [name]: isNaN(num) ? 0 : num };
        // Atualiza extensão se for kmInicial ou kmFinal
        if (name === 'segmentoInicialKm' || name === 'segmentoFinalKm') {
          const ini = name === 'segmentoInicialKm' ? num : next.segmentoInicialKm || 0;
          const fim = name === 'segmentoFinalKm' ? num : next.segmentoFinalKm || 0;
          if (fim >= ini) {
            next.extensaoContratualKm = Math.round((fim - ini) * 1000) / 1000;
          }
        }
        return next;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!formData.numeroContrato?.trim()) {
      setErro('Informe o Número do Contrato (ex: SR-593/2020).');
      return;
    }
    if (!formData.empresaExecutora?.trim()) {
      setErro('Informe a Empresa Executora.');
      return;
    }
    if (!formData.rodovia?.trim() || !formData.uf?.trim()) {
      setErro('Informe a Rodovia e a UF.');
      return;
    }
    if (!formData.dataInicio) {
      setErro('Informe a Data de Início da obra.');
      return;
    }

    setSalvando(true);
    try {
      const contratoFinal: Contrato = {
        id: formData.id || `contrato-${Date.now()}`,
        numeroContrato: formData.numeroContrato.trim(),
        processoSei: formData.processoSei?.trim(),
        contratante: formData.contratante?.trim() || 'DNIT',
        superintendenciaRegional: formData.superintendenciaRegional?.trim() || '',
        unidadeLocal: formData.unidadeLocal?.trim() || '',
        empresaExecutora: formData.empresaExecutora.trim(),
        cnpjExecutora: formData.cnpjExecutora?.trim(),
        empresaSupervisora: formData.empresaSupervisora?.trim(),
        cnpjSupervisora: formData.cnpjSupervisora?.trim(),
        responsavelTecnicoExecutora: formData.responsavelTecnicoExecutora?.trim() || '',
        emailResponsavelExecutora: formData.emailResponsavelExecutora?.trim(),
        artCreaExecutora: formData.artCreaExecutora?.trim(),
        responsavelTecnicoSupervisora: formData.responsavelTecnicoSupervisora?.trim(),
        emailResponsavelSupervisora: formData.emailResponsavelSupervisora?.trim(),
        artCreaSupervisora: formData.artCreaSupervisora?.trim(),
        fiscalDnit: formData.fiscalDnit?.trim() || '',
        emailFiscalDnit: formData.emailFiscalDnit?.trim(),
        portariaFiscal: formData.portariaFiscal?.trim(),

        nomeObra: formData.nomeObra?.trim() || 'Obra Rodoviária',
        tipoEmpreendimento: formData.tipoEmpreendimento || 'Restauração e Manutenção Rodoviária',
        rodovia: formData.rodovia.trim(),
        uf: formData.uf.trim().toUpperCase(),
        trecho: formData.trecho?.trim(),
        subtrecho: formData.subtrecho?.trim(),
        segmentoInicialKm: Number(formData.segmentoInicialKm) || 0,
        segmentoFinalKm: Number(formData.segmentoFinalKm) || 0,
        extensaoContratualKm: Number(formData.extensaoContratualKm) || 0,
        prazoContratualDias: Number(formData.prazoContratualDias) || 365,
        dataInicio: formData.dataInicio,
        dataPrevisaoConclusao: formData.dataPrevisaoConclusao || formData.dataInicio,
        observacoes: formData.observacoes?.trim(),
        ativo: formData.ativo ?? true,
        criadoEm: contratoEmEdicao?.criadoEm || new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      await onSalvar(contratoFinal);

      // Se for novo contrato e marcou para incluir serviços padrão, insere no catálogo
      if (!contratoEmEdicao && incluirServicosPadrao) {
        for (const s of SERVICOS_PADRAO_DNIT) {
          await db.catalogoServicos.put({
            id: `srv-${contratoFinal.id}-${s.nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            contratoId: contratoFinal.id,
            ...s,
            ativo: true,
          });
        }
      }

      onClose();
    } catch (err: any) {
      setErro(`Erro ao salvar contrato: ${err.message || 'Erro inesperado'}`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="my-8 flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-[#0b3b60] text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {contratoEmEdicao ? 'Editar Contrato' : 'Cadastrar Novo Contrato'}
              </h3>
              <p className="text-xs text-sky-200">
                Padrão DNIT — Gestão do Empreendimento e Intervenientes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário com abas de seção */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {erro && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* 1. IDENTIFICAÇÃO DO CONTRATO */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Briefcase className="h-4 w-4 text-sky-700" />
              <span>1. Identificação do Contrato e Órgão</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número do Contrato *
                </label>
                <input
                  type="text"
                  name="numeroContrato"
                  required
                  placeholder="Ex: SR-593/2020"
                  value={formData.numeroContrato}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Processo SEI / Administrativo
                </label>
                <input
                  type="text"
                  name="processoSei"
                  placeholder="Ex: 50600.012345/2020-89"
                  value={formData.processoSei}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contratante
                </label>
                <input
                  type="text"
                  name="contratante"
                  value={formData.contratante}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Superintendência Regional (SR)
                </label>
                <input
                  type="text"
                  name="superintendenciaRegional"
                  placeholder="Ex: SR-AC ou SR-RO"
                  value={formData.superintendenciaRegional}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unidade Local (UL)
                </label>
                <input
                  type="text"
                  name="unidadeLocal"
                  placeholder="Ex: UL Cruzeiro do Sul"
                  value={formData.unidadeLocal}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fiscal do DNIT *
                </label>
                <input
                  type="text"
                  name="fiscalDnit"
                  required
                  placeholder="Nome do fiscal designado"
                  value={formData.fiscalDnit}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail do Fiscal DNIT
                </label>
                <input
                  type="email"
                  name="emailFiscalDnit"
                  placeholder="fiscal@dnit.gov.br"
                  value={formData.emailFiscalDnit}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portaria de Designação
                </label>
                <input
                  type="text"
                  name="portariaFiscal"
                  placeholder="Ex: Portaria nº 1.482/2020"
                  value={formData.portariaFiscal}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. EMPRESAS E RESPONSÁVEIS TÉCNICOS */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Users className="h-4 w-4 text-sky-700" />
              <span>2. Empresas Intervenientes e Responsáveis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bloco Executora */}
              <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-sky-900 uppercase">Empresa Executora (Construtora)</div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Razão Social da Executora *
                  </label>
                  <input
                    type="text"
                    name="empresaExecutora"
                    required
                    placeholder="Ex: LCM Construção e Comércio S/A"
                    value={formData.empresaExecutora}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ da Executora</label>
                  <input
                    type="text"
                    name="cnpjExecutora"
                    placeholder="00.000.000/0001-00"
                    value={formData.cnpjExecutora}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável Técnico</label>
                  <input
                    type="text"
                    name="responsavelTecnicoExecutora"
                    placeholder="Eng. Responsável da Construtora"
                    value={formData.responsavelTecnicoExecutora}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      name="emailResponsavelExecutora"
                      value={formData.emailResponsavelExecutora}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ART / CREA</label>
                    <input
                      type="text"
                      name="artCreaExecutora"
                      placeholder="CREA 123456/D"
                      value={formData.artCreaExecutora}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco Supervisora */}
              <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-sky-900 uppercase">Empresa Supervisora / Gerenciadora</div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social da Supervisora</label>
                  <input
                    type="text"
                    name="empresaSupervisora"
                    placeholder="Ex: Consórcio Supervisor Rodovias"
                    value={formData.empresaSupervisora}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ da Supervisora</label>
                  <input
                    type="text"
                    name="cnpjSupervisora"
                    placeholder="00.000.000/0001-00"
                    value={formData.cnpjSupervisora}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Responsável Técnico</label>
                  <input
                    type="text"
                    name="responsavelTecnicoSupervisora"
                    placeholder="Eng. Supervisor"
                    value={formData.responsavelTecnicoSupervisora}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                    <input
                      type="email"
                      name="emailResponsavelSupervisora"
                      value={formData.emailResponsavelSupervisora}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ART / CREA</label>
                    <input
                      type="text"
                      name="artCreaSupervisora"
                      placeholder="CREA 654321/D"
                      value={formData.artCreaSupervisora}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. DADOS DO EMPREENDIMENTO E LOCALIZAÇÃO */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <MapPin className="h-4 w-4 text-sky-700" />
              <span>3. Dados do Empreendimento e Localização Rodoviária</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome / Descrição da Obra *
                </label>
                <input
                  type="text"
                  name="nomeObra"
                  required
                  placeholder="Ex: Restauração, Melhoramento e Conservação Rodoviária"
                  value={formData.nomeObra}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Empreendimento
                </label>
                <input
                  type="text"
                  name="tipoEmpreendimento"
                  value={formData.tipoEmpreendimento}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rodovia *
                </label>
                <input
                  type="text"
                  name="rodovia"
                  required
                  placeholder="Ex: BR-364"
                  value={formData.rodovia}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">UF *</label>
                <input
                  type="text"
                  name="uf"
                  required
                  maxLength={2}
                  placeholder="Ex: AC"
                  value={formData.uf}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trecho</label>
                <input
                  type="text"
                  name="trecho"
                  placeholder="Ex: Entroncamento BR-317 - Feijó"
                  value={formData.trecho}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtrecho</label>
                <input
                  type="text"
                  name="subtrecho"
                  placeholder="Ex: km 250,000 ao km 300,000"
                  value={formData.subtrecho}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Segmento Inicial (km)
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="segmentoInicialKm"
                  value={formData.segmentoInicialKm}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Segmento Final (km)
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="segmentoFinalKm"
                  value={formData.segmentoFinalKm}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Extensão Contratual (km)
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="extensaoContratualKm"
                  value={formData.extensaoContratualKm}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* 4. PRAZOS CONTRATUAIS */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Calendar className="h-4 w-4 text-sky-700" />
              <span>4. Prazos e Vigência Contratual</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo Contratual Total (dias) *
                </label>
                <input
                  type="number"
                  name="prazoContratualDias"
                  required
                  value={formData.prazoContratualDias}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Início da Obra *
                </label>
                <input
                  type="date"
                  name="dataInicio"
                  required
                  value={formData.dataInicio}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data Prevista de Conclusão *
                </label>
                <input
                  type="date"
                  name="dataPrevisaoConclusao"
                  required
                  value={formData.dataPrevisaoConclusao}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Gerais do Contrato
            </label>
            <textarea
              name="observacoes"
              rows={2}
              placeholder="Informações contratuais adicionais..."
              value={formData.observacoes}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {!contratoEmEdicao && (
            <div className="rounded-lg bg-sky-50 p-3.5 border border-sky-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="servicosPadraoCheck"
                checked={incluirServicosPadrao}
                onChange={(e) => setIncluirServicosPadrao(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="servicosPadraoCheck" className="text-xs text-sky-950 font-medium cursor-pointer">
                <strong>Importar catálogo de serviços de referência DNIT</strong> (Regularização de Subleito, Revestimento Primário, Sub-base, CBUQ, Drenagem, Roçada e Sinalização conforme Anexo B).
              </label>
            </div>
          )}
        </form>

        {/* Rodapé / Ações */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={salvando}
            className="flex items-center gap-2 rounded-lg bg-[#0b3b60] px-5 py-2 text-xs font-bold text-white hover:bg-[#082842] transition shadow-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {salvando ? 'Salvando...' : 'Salvar Contrato'}
          </button>
        </div>
      </div>
    </div>
  );
};
