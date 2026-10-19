'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Clipboard, Check, X } from 'lucide-react';
import { LineItem } from '@/types/project';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLines: (newLines: LineItem[], mode: 'replace' | 'append') => Promise<void>;
  currentLineCount: number;
}

export default function ImportModal({
  isOpen,
  onClose,
  onImportLines,
  currentLineCount,
}: ImportModalProps) {
  const [tab, setTab] = useState<'paste' | 'file'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [ignoreEmptyLines, setIgnoreEmptyLines] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const activeRawText = tab === 'paste' ? pastedText : (fileContent || '');

  const parsedLines = activeRawText
    .split(/\r?\n/)
    .filter((line) => !ignoreEmptyLines || line.trim().length > 0)
    .map((text) => ({ text, status: 0 }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  const handleConfirm = async () => {
    if (parsedLines.length === 0) return;
    setLoading(true);
    try {
      await onImportLines(parsedLines, importMode);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Importar Texto</h2>
              <p className="text-xs text-slate-500">Cada linha corresponderá a um objeto na lista</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTab('paste')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition ${
              tab === 'paste'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5" />
            Colar Texto
          </button>
          <button
            type="button"
            onClick={() => setTab('file')}
            className={`flex items-center gap-1.5 px-3 py-2 font-medium border-b-2 transition ${
              tab === 'file'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Ficheiro TXT
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white text-xs">
          {tab === 'paste' ? (
            <div className="space-y-1.5">
              <label className="text-slate-600 block font-medium">
                Cole o texto (cada quebra de linha criará uma linha na lista):
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Cole o texto aqui..."
                rows={9}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".txt,text/plain"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition text-center group"
              >
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 mb-2 transition" />
                <p className="text-xs font-semibold text-slate-700">
                  {fileName ? fileName : 'Clique para selecionar um ficheiro .txt'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Suporta ficheiros UTF-8 simples</p>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Modo de Inserção:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-2.5 py-1 rounded text-xs transition border ${
                    importMode === 'replace'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 font-medium'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Substituir tudo ({currentLineCount} lin.)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('append')}
                  className={`px-2.5 py-1 rounded text-xs transition border ${
                    importMode === 'append'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Acrescentar ao fim
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
              <input
                type="checkbox"
                id="ignoreEmpty"
                checked={ignoreEmptyLines}
                onChange={(e) => setIgnoreEmptyLines(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="ignoreEmpty" className="text-slate-500 cursor-pointer">
                Ignorar linhas totalmente em branco ao importar
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Total de linhas detetadas:</span>
            <strong className="text-slate-800 font-mono">{parsedLines.length} linhas</strong>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded hover:bg-slate-200 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={parsedLines.length === 0 || loading}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition disabled:opacity-50"
          >
            {loading ? 'A importar...' : `Importar ${parsedLines.length} Linhas`}
          </button>
        </div>
      </div>
    </div>
  );
}
