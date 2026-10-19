'use client';

import React, { useState } from 'react';
import { LineItem, TextState } from '@/types/project';
import { getContrastTextColor } from '@/lib/colorUtils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
} from 'lucide-react';

interface LineListViewProps {
  lines: LineItem[];
  statuses: TextState[];
  currentPage: number;
  linesPerPage: number;
  onPageChange: (page: number) => void;
  onUpdateLineStatus: (lineIndex: number, newStatus: number) => void;
  onSetRangeStart: (lineNum: number) => void;
  onSetRangeEnd: (lineNum: number) => void;
  selectedStartLine: number;
  selectedEndLine: number;
}

export default function LineListView({
  lines,
  statuses,
  currentPage,
  linesPerPage,
  onPageChange,
  onSetRangeStart,
  onSetRangeEnd,
  selectedStartLine,
  selectedEndLine,
}: LineListViewProps) {
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');
  const [pageInput, setPageInput] = useState('');

  const totalLines = lines.length;
  const totalPages = Math.max(1, Math.ceil(totalLines / linesPerPage));

  // Slices for current page (500 lines)
  const pageStartIdx = (currentPage - 1) * linesPerPage;
  const pageEndIdx = Math.min(totalLines, currentPage * linesPerPage);
  const pageLines = lines.slice(pageStartIdx, pageEndIdx);

  // Filter within current page
  const displayedItems = pageLines
    .map((item, idx) => ({
      item,
      originalIndex: pageStartIdx + idx,
      lineNum: pageStartIdx + idx + 1,
    }))
    .filter(({ item }) => {
      const matchesText =
        filterText === '' || item.text.toLowerCase().includes(filterText.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesText && matchesStatus;
    });

  const getStatus = (statusId: number): TextState => {
    return (
      statuses.find((s) => s.id === statusId) || {
        id: statusId,
        name: `Estado ${statusId}`,
        color: '#ffffff',
      }
    );
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setPageInput('');
    }
  };

  // Quick range click on line number
  const handleLineClick = (lineNum: number) => {
    if (lineNum < selectedStartLine) {
      onSetRangeStart(lineNum);
    } else {
      onSetRangeEnd(lineNum);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden text-slate-800">
      {/* Clean Light Filter & Pagination Sub-header */}
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search & Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filtrar texto na página..."
              className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 text-xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="bg-transparent text-slate-700 text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="all">Todos os Estados</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}: {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clean Pagination Controls */}
        <div className="flex items-center gap-3">
          <div className="text-slate-500 font-medium">
            <span className="text-slate-800 font-mono font-semibold">
              {totalLines > 0 ? pageStartIdx + 1 : 0} – {pageEndIdx}
            </span>{' '}
            de <span className="font-mono text-slate-700">{totalLines}</span> linhas
          </div>

          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
              title="Primeira Página"
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Página Anterior"
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-mono font-semibold text-blue-600">
              Pág. {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Página Seguinte"
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              title="Última Página"
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to page */}
          <form onSubmit={handleJumpPage} className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder="Pág."
              className="w-12 bg-white border border-slate-200 rounded px-1.5 py-1 text-xs text-center text-slate-700 focus:outline-hidden focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            >
              Ir
            </button>
          </form>
        </div>
      </div>

      {/* Main Text Content: Clean, continuous lines with background color of status */}
      <div className="flex-1 overflow-y-auto bg-white font-mono text-[13px] leading-relaxed select-text">
        {totalLines === 0 ? (
          <div className="py-24 text-center space-y-2 text-slate-400">
            <p className="text-sm font-semibold text-slate-600">Este texto ainda não tem linhas.</p>
            <p className="text-xs">Use o botão &quot;Importar TXT&quot; acima para adicionar texto.</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Nenhuma linha corresponde aos filtros nesta página.
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {displayedItems.map(({ item, originalIndex, lineNum }) => {
              const st = getStatus(item.status);
              const contrast = getContrastTextColor(st.color);
              const isSelectedRange =
                lineNum >= selectedStartLine && lineNum <= selectedEndLine;
              const isWhite =
                !st.color ||
                st.color.toLowerCase() === '#ffffff' ||
                st.color.toLowerCase() === '#fff' ||
                st.color === 'rgb(255, 255, 255)';

              return (
                <div
                  key={originalIndex}
                  onClick={() => handleLineClick(lineNum)}
                  className={`flex items-start transition-colors duration-75 cursor-pointer ${
                    isSelectedRange ? 'outline-2 outline-blue-500 outline-offset-[-2px] z-10' : ''
                  }`}
                  style={{
                    backgroundColor: isWhite ? '#ffffff' : st.color,
                    color: isWhite ? '#1e293b' : contrast,
                  }}
                  title={`Linha #${lineNum} • Estado: ${st.name} (Clique para definir intervalo)`}
                >
                  {/* Line Number Column (Clean gutter on the left) */}
                  <div
                    className="w-16 shrink-0 py-1 pr-3 text-right text-xs font-mono select-none opacity-60 border-r border-slate-200/60"
                    style={{
                      color: isWhite ? '#64748b' : contrast,
                      backgroundColor: isWhite ? '#f8fafc' : 'rgba(0,0,0,0.04)',
                    }}
                  >
                    {lineNum}
                  </div>

                  {/* Clean Text Line: strictly text and status background color, no clutter */}
                  <div className="flex-1 py-1 px-4 whitespace-pre-wrap break-words min-h-[26px]">
                    {item.text || (
                      <span className="opacity-25 italic font-sans text-xs select-none">
                        &lt;linha vazia&gt;
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            A mostrar página <strong>{currentPage}</strong> de <strong>{totalPages}</strong> (500 linhas por página)
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:pointer-events-none font-medium"
            >
              ← Anterior
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-30 disabled:pointer-events-none font-medium"
            >
              Seguinte →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
