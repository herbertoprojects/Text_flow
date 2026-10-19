'use client';

import React, { useState } from 'react';
import { ProjectSummary } from '@/types/project';
import {
  FolderPlus,
  Search,
  FileText,
  MoreVertical,
  Trash2,
  Edit2,
  History,
  Folder,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  projects: ProjectSummary[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onOpenNewProjectModal: () => void;
  onDeleteProject: (id: string, name: string) => Promise<void>;
  onRenameProject: (id: string, currentName: string) => Promise<void>;
  onOpenBackups: (projectId: string, projectName: string) => void;
}

export default function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onOpenNewProjectModal,
  onDeleteProject,
  onRenameProject,
  onOpenBackups,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <div className="bg-slate-50 border-r border-slate-200 w-12 shrink-0 flex flex-col items-center py-3 justify-between transition-all">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onOpenNewProjectModal}
            title="Criar Novo Projeto"
            className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition"
          >
            <FolderPlus className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-slate-200" />

          {projects.slice(0, 8).map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              title={`${p.name} (${p.lineCount} linhas)`}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold transition ${
                activeProjectId === p.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {p.name.substring(0, 2).toUpperCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          title="Expandir Menu"
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 h-full select-none text-slate-800">
      {/* Top Header & New Project Button */}
      <div className="p-3 border-b border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-slate-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Projetos ({projects.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            title="Recolher Menu"
            className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ Novo Projeto</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {searchTerm ? 'Nenhum projeto encontrado' : 'Sem projetos'}
          </div>
        ) : (
          filtered.map((p) => {
            const isActive = activeProjectId === p.id;
            const isMenuOpen = menuOpenId === p.id;

            return (
              <div
                key={p.id}
                className={`group relative rounded-lg border transition p-2.5 cursor-pointer ${
                  isActive
                    ? 'bg-white border-blue-500 shadow-2xs'
                    : 'bg-white/60 border-transparent hover:bg-white hover:border-slate-200'
                }`}
                onClick={() => onSelectProject(p.id)}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isActive ? 'text-blue-900' : 'text-slate-800'
                      }`}
                    >
                      {p.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <FileText className="w-3 h-3 text-slate-400" />
                        {p.lineCount} lin.
                      </span>

                      <span>•</span>

                      {p.hasTodayBackup ? (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Backup Hoje ✓
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600">
                          Sem backup
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div
                    className="relative shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(isMenuOpen ? null : p.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-30 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onRenameProject(p.id, p.name);
                          }}
                          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                          Renomear
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onOpenBackups(p.id, p.name);
                          }}
                          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <History className="w-3.5 h-3.5 text-teal-600" />
                          Backups
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onDeleteProject(p.id, p.name);
                          }}
                          className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
