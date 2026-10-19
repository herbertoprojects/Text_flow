'use client';

import React, { useState } from 'react';
import { FolderPlus, FileText, Upload, X } from 'lucide-react';
import { LineItem } from '@/types/project';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, description: string, lines: LineItem[]) => Promise<void>;
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialType, setInitialType] = useState<'empty' | 'paste' | 'file'>('empty');
  const [pastedText, setPastedText] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      let lines: LineItem[] = [];
      if (initialType === 'paste' && pastedText.trim()) {
        lines = pastedText.split(/\r?\n/).map((text) => ({ text, status: 0 }));
      } else if (initialType === 'file' && fileContent) {
        lines = fileContent.split(/\r?\n/).map((text) => ({ text, status: 0 }));
      }

      await onCreateProject(name.trim(), description.trim(), lines);
      setName('');
      setDescription('');
      setPastedText('');
      setFileContent(null);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Novo Projeto</h2>
              <p className="text-xs text-slate-500">Guardado em ficheiro JSON com backup diário automático</p>
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
          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Nome do Projeto <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Conto II, Capítulo de Revisão..."
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1">
              Descrição / Notas (Opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Revisão de texto e estados"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-700 font-medium block">
              Texto Inicial
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setInitialType('empty')}
                className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                  initialType === 'empty'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Em Branco</span>
              </button>
              <button
                type="button"
                onClick={() => setInitialType('paste')}
                className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                  initialType === 'paste'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Colar Texto</span>
              </button>
              <button
                type="button"
                onClick={() => setInitialType('file')}
                className={`p-2.5 rounded-lg border text-center transition flex flex-col items-center gap-1 ${
                  initialType === 'file'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Ficheiro TXT</span>
              </button>
            </div>

            {initialType === 'paste' && (
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Cole o texto aqui..."
                rows={4}
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-800 focus:outline-hidden focus:border-emerald-500"
              />
            )}

            {initialType === 'file' && (
              <div className="space-y-1.5 pt-1">
                <input
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-slate-200 file:text-xs file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                />
                {fileName && <p className="text-xs text-emerald-600">Ficheiro: {fileName}</p>}
              </div>
            )}
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
              disabled={!name.trim() || loading}
              className="px-4 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'A criar...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
