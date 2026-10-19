'use client';

import React, { useState } from 'react';
import { LineItem, TextState } from '@/types/project';
import { Edit3, Copy, Save, X, ArrowRight, Layers } from 'lucide-react';

interface RangeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  startLine: number; // 1-indexed
  endLine: number;   // 1-indexed
  originalLines: LineItem[];
  statuses: TextState[];
  onSaveRange: (
    newLines: LineItem[],
    startIdx: number,
    deleteCount: number
  ) => Promise<void>;
  currentPage: number;
}

export default function RangeEditModal({
  isOpen,
  onClose,
  startLine,
  endLine,
  originalLines,
  statuses,
  onSaveRange,
  currentPage,
}: RangeEditModalProps) {
  const [alteredText, setAlteredText] = useState('');
  const [assignStatusMode, setAssignStatusMode] = useState<'keep' | 'specific'>('keep');
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Sliced original lines (0-indexed: startLine - 1 to endLine)
  const startIdx = Math.max(0, startLine - 1);
  const endIdx = Math.min(originalLines.length, endLine);
  const selectedOriginal = originalLines.slice(startIdx, endIdx);
  const originalCount = selectedOriginal.length;

  // Plain continuous text as requested by user ("todo seguido")
  const originalPlainString = selectedOriginal.map((item) => item.text).join('\n');

  // Compute altered lines count
  const parsedAlteredLines = alteredText.split('\n');
  const newCount = alteredText === '' ? 0 : parsedAlteredLines.length;
  const lineDelta = newCount - originalCount;

  const handleCopyOriginal = () => {
    setAlteredText(originalPlainString);
  };

  const handleSave = async () => {
    if (alteredText === '' && newCount === 0) {
      const confirmEmpty = window.confirm(
        'A caixa de texto alterado está vazia. Isto irá remover todas as linhas do intervalo selecionado. Deseja continuar?'
      );
      if (!confirmEmpty) return;
    }

    setSaving(true);
    try {
      const newItems: LineItem[] = parsedAlteredLines.map((line, idx) => {
        let status = 0;
        if (assignStatusMode === 'keep') {
          if (idx < selectedOriginal.length) {
            status = selectedOriginal[idx].status;
          } else {
            status = 0;
          }
        } else {
          status = selectedStatusId;
        }
        return { text: line, status };
      });

      await onSaveRange(newItems, startIdx, originalCount);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Editar Intervalo: Linhas {startLine} a {endLine}
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200/80 text-slate-700">
                  {originalCount} {originalCount === 1 ? 'linha' : 'linhas'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Página atual: <strong>{currentPage}</strong> (após guardar, a app manterá esta página ativa)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Two Boxes - Both with continuous text as requested ("todo seguido") */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Texto Original todo seguido */}
            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-700">
                  1. Texto Original ({originalCount} linhas)
                </span>
                <button
                  type="button"
                  onClick={handleCopyOriginal}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 shadow-2xs transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar para Caixa 2
                </button>
              </div>

              {/* Continuous text box - no colored individual blocks */}
              <textarea
                readOnly
                value={originalPlainString}
                rows={16}
                className="w-full bg-white p-3.5 text-xs font-mono text-slate-800 focus:outline-hidden resize-none leading-relaxed flex-1 select-text"
                placeholder="Texto original..."
              />
            </div>

            {/* Box 2: Texto Alterado em branco */}
            <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-700">
                  2. Texto Alterado (Cole ou edite aqui)
                </span>
                <span className="text-xs font-mono font-medium text-slate-500">
                  {newCount} {newCount === 1 ? 'linha' : 'linhas'}
                </span>
              </div>

              <textarea
                value={alteredText}
                onChange={(e) => setAlteredText(e.target.value)}
                placeholder="Caixa em branco: Cole ou escreva aqui o novo texto. As linhas adicionadas ou removidas ajustarão automaticamente as linhas seguintes da lista..."
                rows={16}
                className="w-full bg-white p-3.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden resize-none leading-relaxed flex-1"
                autoFocus
              />
            </div>
          </div>

          {/* Simple summary strip */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">Ajuste da lista:</span>
              <span className="font-semibold text-slate-800 font-mono">
                {originalCount} originais → {newCount} novas
              </span>
              <span
                className={`font-semibold font-mono ${
                  lineDelta > 0
                    ? 'text-emerald-600'
                    : lineDelta < 0
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                ({lineDelta > 0 ? `+${lineDelta}` : lineDelta} linhas)
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <span>Estado das novas linhas:</span>
              <select
                value={assignStatusMode === 'keep' ? 'keep' : String(selectedStatusId)}
                onChange={(e) => {
                  if (e.target.value === 'keep') {
                    setAssignStatusMode('keep');
                  } else {
                    setAssignStatusMode('specific');
                    setSelectedStatusId(Number(e.target.value));
                  }
                }}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="keep">Manter estados originais</option>
                {statuses.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    Definir: {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            Ao guardar, regressa à <strong>Página {currentPage}</strong> com o texto atualizado.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'A guardar...' : 'Guardar e Voltar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
