import React, { useState } from 'react';
import { Camera, Upload, Trash2, MapPin, ZoomIn, X, Compass, AlertCircle, Info } from 'lucide-react';
import type { Rdo, FotoItem } from '../../types';
import { comprimirImagem } from '../../utils/imageCompressor';

interface EtapaFotosProps {
  rdo: Rdo;
  onChange: (atualizacao: Partial<Rdo>) => void;
}

export const EtapaFotos: React.FC<EtapaFotosProps> = ({ rdo, onChange }) => {
  const [fotoAmpliada, setFotoAmpliada] = useState<FotoItem | null>(null);
  const [processandoFoto, setProcessandoFoto] = useState(false);
  const [capturandoGps, setCapturandoGps] = useState(false);
  const [gpsErro, setGpsErro] = useState<string | null>(null);

  // Form para nova foto
  const [descricao, setDescricao] = useState('');
  const [servicoRelacionado, setServicoRelacionado] = useState(
    rdo.servicosExecutados.length > 0 ? rdo.servicosExecutados[0].nomeServico : ''
  );
  const [segmento, setSegmento] = useState(
    rdo.servicosExecutados.length > 0
      ? `km ${rdo.servicosExecutados[0].kmInicial.toFixed(3)} ao km ${rdo.servicosExecutados[0].kmFinal.toFixed(3)}`
      : ''
  );
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [dataCaptura, setDataCaptura] = useState(
    `${rdo.data || new Date().toISOString().split('T')[0]} 14:00`
  );
  const [dataExecucao, setDataExecucao] = useState(rdo.data || new Date().toISOString().split('T')[0]);
  const [legenda, setLegenda] = useState('');
  const [fotoDataUrl, setFotoDataUrl] = useState<string>('');

  const obterLocalizacaoGps = () => {
    if (!navigator.geolocation) {
      setGpsErro('Geolocalização não é suportada por este dispositivo.');
      return;
    }

    setCapturandoGps(true);
    setGpsErro(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setCapturandoGps(false);
      },
      (err) => {
        setGpsErro(`Não foi possível obter GPS: ${err.message}. Você pode preencher manualmente.`);
        setCapturandoGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessandoFoto(true);
    try {
      // Comprime a foto no cliente antes de armazenar
      const comprimida = await comprimirImagem(file, 1280, 960, 0.75);
      setFotoDataUrl(comprimida);
      if (!descricao) {
        setDescricao(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (!legenda) {
        setLegenda(`Foto ${rdo.fotografias.length + 1} — Registro fotográfico de execução`);
      }
    } catch (err: any) {
      alert(`Erro ao processar imagem: ${err.message}`);
    } finally {
      setProcessandoFoto(false);
    }
  };

  const handleSalvarFoto = () => {
    if (!fotoDataUrl) {
      alert('Por favor, tire uma foto ou selecione uma imagem do arquivo.');
      return;
    }

    const novaFoto: FotoItem = {
      id: `ft-${Date.now()}`,
      fotoUrl: fotoDataUrl,
      descricao: descricao.trim() || 'Evidência fotográfica',
      servicoRelacionado: servicoRelacionado.trim() || undefined,
      segmento: segmento.trim() || 'Segmento da obra',
      latitude: latitude !== '' ? Number(latitude) : undefined,
      longitude: longitude !== '' ? Number(longitude) : undefined,
      dataCaptura,
      dataExecucao,
      legenda: legenda.trim() || descricao.trim(),
    };

    onChange({
      fotografias: [...rdo.fotografias, novaFoto],
    });

    // Limpa formulário
    setFotoDataUrl('');
    setDescricao('');
    setLegenda('');
  };

  const handleRemoverFoto = (id: string) => {
    onChange({
      fotografias: rdo.fotografias.filter((f) => f.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* Alerta legal */}
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
        <Info className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-slate-900">
            Evidências Fotográficas e Metadados Técnicos (Norma DNIT 097/2025)
          </div>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            As imagens são comprimidas automaticamente no dispositivo para otimizar espaço sem perder a legibilidade. Os metadados registrados não substituem a comprovação da autenticidade formal das evidências perante o DNIT.
          </p>
        </div>
      </div>

      {/* Bloco 1: Upload / Captura de Nova Foto */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Camera className="h-4 w-4 text-sky-700" />
          <span>Anexar Nova Fotografia de Campo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Seletor / Pré-visualização da imagem */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center min-h-[220px]">
            {fotoDataUrl ? (
              <div className="relative w-full h-full flex flex-col items-center">
                <img
                  src={fotoDataUrl}
                  alt="Pré-visualização"
                  className="max-h-48 w-auto rounded-lg object-contain shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setFotoDataUrl('')}
                  className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                >
                  Trocar imagem
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700 mb-2">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {processandoFoto ? 'Comprimindo foto...' : 'Tirar Foto ou Carregar Arquivo'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  JPG ou PNG (Câmera do celular compatível)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleUploadFoto}
                  disabled={processandoFoto}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Campos de metadados da foto */}
          <div className="md:col-span-8 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serviço Relacionado
                </label>
                <select
                  value={servicoRelacionado}
                  onChange={(e) => setServicoRelacionado(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="">Geral da Obra / Trecho</option>
                  {rdo.servicosExecutados.map((s) => (
                    <option key={s.id} value={s.nomeServico}>
                      {s.nomeServico}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Segmento / Estaca
                </label>
                <input
                  type="text"
                  placeholder="Ex: km 272,850 ou Estaca 13640"
                  value={segmento}
                  onChange={(e) => setSegmento(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data/Hora da Captura *
                </label>
                <input
                  type="text"
                  placeholder="AAAA-MM-DD HH:mm"
                  value={dataCaptura}
                  onChange={(e) => setDataCaptura(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data da Execução do Serviço
                </label>
                <input
                  type="date"
                  value={dataExecucao}
                  onChange={(e) => setDataExecucao(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Georreferenciamento */}
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-sky-700" />
                  Coordenadas Geográficas (GPS)
                </span>
                <button
                  type="button"
                  onClick={obterLocalizacaoGps}
                  disabled={capturandoGps}
                  className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-100/70 px-2 py-0.5 rounded"
                >
                  <Compass className="h-3 w-3" />
                  {capturandoGps ? 'Obtendo GPS...' : 'Capturar do Celular/GPS'}
                </button>
              </div>

              {gpsErro && <div className="text-[10px] text-amber-700">{gpsErro}</div>}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Latitude (ex: -9.071234)"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs"
                />
                <input
                  type="number"
                  step="0.000001"
                  placeholder="Longitude (ex: -70.324567)"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legenda Oficial da Foto (Anexo A) *
              </label>
              <input
                type="text"
                placeholder="Ex: Foto 01 — Operação do rolo compactador sobre camada de revestimento primário no km 272,850."
                value={legenda}
                onChange={(e) => setLegenda(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden font-medium"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSalvarFoto}
                disabled={!fotoDataUrl}
                className="flex items-center gap-1.5 rounded-lg bg-[#0b3b60] px-4 py-2 text-xs font-bold text-white hover:bg-[#082842] shadow-xs disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Adicionar Evidência ao RDO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 2: Galeria de Fotos Lançadas */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Fotografias Anexadas ({rdo.fotografias.length})
          </div>
          <span className="text-[11px] text-slate-400">
            Serão diagramadas no PDF e listadas na Planilha Excel
          </span>
        </div>

        {rdo.fotografias.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhuma evidência fotográfica anexada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rdo.fotografias.map((foto, index) => (
              <div
                key={foto.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col justify-between group hover:shadow-md transition"
              >
                <div>
                  <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-slate-200 mb-2">
                    {foto.fotoUrl ? (
                      <img
                        src={foto.fotoUrl}
                        alt={foto.legenda}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex w-full h-full items-center justify-center text-slate-400">
                        <Camera className="h-8 w-8" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setFotoAmpliada(foto)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition text-white"
                      title="Ampliar visualização"
                    >
                      <ZoomIn className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {foto.legenda || foto.descricao}
                  </div>

                  <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                    <div>
                      <strong>Segmento:</strong> {foto.segmento || '-'}
                    </div>
                    {foto.latitude && foto.longitude && (
                      <div className="font-mono text-[10px]">
                        GPS: {foto.latitude.toFixed(6)}, {foto.longitude.toFixed(6)}
                      </div>
                    )}
                    <div>
                      Data: {foto.dataCaptura || foto.dataExecucao}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoverFoto(foto.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Zoom da Foto */}
      {fotoAmpliada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="relative max-w-3xl w-full rounded-2xl bg-white p-4 shadow-2xl">
            <button
              onClick={() => setFotoAmpliada(null)}
              className="absolute right-3 top-3 rounded-full bg-slate-900/60 p-1.5 text-white hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="max-h-[70vh] overflow-hidden rounded-xl flex items-center justify-center bg-slate-950">
              <img
                src={fotoAmpliada.fotoUrl}
                alt={fotoAmpliada.legenda}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="mt-3 text-xs text-slate-700">
              <div className="font-bold text-sm text-slate-900">{fotoAmpliada.legenda}</div>
              <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-500">
                <span>Serviço: {fotoAmpliada.servicoRelacionado || '-'}</span>
                <span>Segmento: {fotoAmpliada.segmento || '-'}</span>
                {fotoAmpliada.latitude && fotoAmpliada.longitude && (
                  <span>
                    Coordenadas: {fotoAmpliada.latitude.toFixed(6)}, {fotoAmpliada.longitude.toFixed(6)}
                  </span>
                )}
                <span>Captura: {fotoAmpliada.dataCaptura}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
