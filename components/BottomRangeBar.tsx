'use client';

import React from 'react';
import { Edit3, ArrowRight } from 'lucide-react';

interface BottomRangeBarProps {
  totalLines: number;
  startLine: number;
  endLine: number;
  onChangeStartLine: (val: number) => void;
  onChangeEndLine: (val: number) => void;
  onOpenRangeEditor: () => void;
  currentPage: number;
  linesPerPage: number;
  onSelectCurrentPageRange: () => void;
}

export default function BottomRangeBar({
  totalLines,
  startLine,
  endLine,
  onChangeStartLine,
  onChangeEndLine,
  onOpenRangeEditor,
  currentPage,
  linesPerPage,
  onSelectCurrentPageRange,
}: BottomRangeBarProps) {
  if (totalLines === 0) return null;

  const validStart = Math.max(1, Math.min(totalLines, startLine || 1));
  const validEnd = Math.max(validStart, Math.min(totalLines, endLine || validStart));
  const selectedCount = validEnd >= validStart ? validEnd - validStart + 1 : 0;

  return (
    <div className="sticky bottom-0 z-20 bg-white/95 border-t border-slate-200 backdrop-blur-xs px-4 py-2.5 shadow-sm text-slate-800">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Range Selection Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">
            Intervalo a Editar:
          </span>

          <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-500">Linha:</span>
            <input
              type="number"
              min={1}
              max={totalLines}
              value={startLine}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChangeStartLine(val);
              }}
              className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
            />

            <ArrowRight className="w-3 h-3 text-slate-400" />

            <span className="text-slate-500">até:</span>
            <input
              type="number"
              min={validStart}
              max={totalLines}
              value={endLine}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChangeEndLine(val);
              }}
              className="w-14 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-center font-mono font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Quick page preset */}
          <button
            type="button"
            onClick={onSelectCurrentPageRange}
            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
          >
            Página Atual ({((currentPage - 1) * linesPerPage) + 1} – {Math.min(totalLines, currentPage * linesPerPage)})
          </button>
        </div>

        {/* Right: Selected Summary & Open Button */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden sm:inline">
            <strong className="text-slate-800 font-mono">{selectedCount}</strong> {selectedCount === 1 ? 'linha selecionada' : 'linhas selecionadas'}
          </span>

          <button
            type="button"
            onClick={onOpenRangeEditor}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar Linhas {validStart} a {validEnd}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
