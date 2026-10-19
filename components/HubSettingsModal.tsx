'use client';

import React, { useState } from 'react';
import { AppSettings } from '@/types/project';
import { ExternalLink, Server, Globe, Save, X, Info } from 'lucide-react';

interface HubSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: Partial<AppSettings>) => Promise<void>;
}

export default function HubSettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: HubSettingsModalProps) {
  const [protocol, setProtocol] = useState<'http' | 'https'>(settings.hubProtocol || 'http');
  const [host, setHost] = useState(settings.hubHost || 'localhost');
  const [port, setPort] = useState<number>(settings.hubPort || 80);
  const [customPath, setCustomPath] = useState(settings.customUrl || '');
  const [linesPerPage, setLinesPerPage] = useState<number>(settings.linesPerPage || 500);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const computedHubUrl =
    customPath.trim() ||
    `${protocol}://${host}${
      port === 80 && protocol === 'http'
        ? ''
        : port === 443 && protocol === 'https'
        ? ''
        : `:${port}`
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        hubProtocol: protocol,
        hubHost: host.trim(),
        hubPort: Number(port),
        customUrl: customPath.trim(),
        linesPerPage: Number(linesPerPage),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Configurar Hub & Portas</h2>
              <p className="text-xs text-slate-500">Destino do link para a porta 80 ou 443 do seu servidor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto bg-white text-xs">
          <div className="space-y-2.5">
            <label className="text-slate-700 font-semibold block">
              Endereço do Hub Central (Porta 80 / 443)
            </label>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              O botão &quot;Voltar ao Hub&quot; na barra superior encaminha diretamente para o servidor central que faz o direcionamento das suas aplicações.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Protocolo</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-800 focus:outline-hidden"
                >
                  <option value="http">http://</option>
                  <option value="https">https://</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Host / IP</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost"
                  className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Porta Hub</label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-800 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-slate-500">Atalhos:</span>
              <button
                type="button"
                onClick={() => { setPort(80); setProtocol('http'); }}
                className={`px-2 py-0.5 rounded border text-[11px] ${
                  port === 80 && protocol === 'http'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-medium'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Porta 80 (HTTP)
              </button>
              <button
                type="button"
                onClick={() => { setPort(443); setProtocol('https'); }}
                className={`px-2 py-0.5 rounded border text-[11px] ${
                  port === 443 && protocol === 'https'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-medium'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Porta 443 (HTTPS)
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">URL configurado:</span>
                <span className="font-mono text-emerald-600 font-medium text-xs">{computedHubUrl}</span>
              </div>
              <a
                href={computedHubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink className="w-3 h-3" />
                Testar
              </a>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 space-y-1 text-slate-700">
            <span className="font-semibold text-blue-900 block flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Execução Node.js na Porta 3001
            </span>
            <p className="text-[11px] text-slate-600">
              No seu servidor, inicie a app na porta 3001 com:
            </p>
            <code className="block bg-white p-1 rounded font-mono text-[11px] text-blue-800 border border-blue-200">
              npm run start:3001
            </code>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              Linhas por Página
            </label>
            <select
              value={linesPerPage}
              onChange={(e) => setLinesPerPage(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden"
            >
              <option value="500">500 linhas por página (Padrão)</option>
              <option value="250">250 linhas por página</option>
              <option value="100">100 linhas por página</option>
              <option value="1000">1000 linhas por página</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-50"
            >
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
