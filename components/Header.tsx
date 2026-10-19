'use client';

import React, { useState } from 'react';
import { Project, AppSettings } from '@/types/project';
import {
  Globe,
  Settings,
  Upload,
  Palette,
  History,
  Download,
  Save,
  Check,
  FileCode,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  project: Project | null;
  settings: AppSettings;
  onOpenHubSettings: () => void;
  onOpenStatusManager: () => void;
  onOpenImport: () => void;
  onOpenBackups: () => void;
  onSaveManual: () => Promise<void>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  hasTodayBackup: boolean;
}

export default function Header({
  project,
  settings,
  onOpenHubSettings,
  onOpenStatusManager,
  onOpenImport,
  onOpenBackups,
  onSaveManual,
  isSaving,
  hasUnsavedChanges,
  hasTodayBackup,
}: HeaderProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const hubUrl =
    settings.customUrl?.trim() ||
    `${settings.hubProtocol || 'http'}://${settings.hubHost || 'localhost'}${
      settings.hubPort === 80 && settings.hubProtocol === 'http'
        ? ''
        : settings.hubPort === 443 && settings.hubProtocol === 'https'
        ? ''
        : `:${settings.hubPort || 80}`
    }`;

  const handleExportJson = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const handleExportTxt = () => {
    if (!project) return;
    const plainText = project.lines.map((l) => l.text).join('\n');
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 px-4 lg:px-6 py-2.5 shrink-0 z-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Brand & Hub Direct Connection */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              TF
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-900">TextFlow</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono font-medium rounded bg-slate-100 text-slate-600 border border-slate-200">
                  :3001
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Hub Link (Port 80/443) requested by user */}
          <div className="flex items-center gap-1.5 bg-slate-50 pl-2.5 pr-1.5 py-1 rounded-lg border border-slate-200 text-xs">
            <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <a
              href={hubUrl}
              target="_blank"
              rel="noreferrer"
              title={`Abrir Hub em ${hubUrl}`}
              className="font-medium text-slate-700 hover:text-blue-600 transition flex items-center gap-1"
            >
              <span>Voltar ao Hub</span>
              <span className="text-[10px] text-slate-400 font-mono">
                (:{settings.hubPort || 80})
              </span>
            </a>
            <button
              type="button"
              onClick={onOpenHubSettings}
              title="Configurar endereço do Hub"
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 transition"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Side: Active Project Actions */}
        {project && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status Manager button */}
            <button
              type="button"
              onClick={onOpenStatusManager}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 font-medium text-slate-700 border border-slate-200 shadow-2xs transition"
              title="Gerir Estados e Cores RGB deste texto"
            >
              <Palette className="w-3.5 h-3.5 text-amber-500" />
              <span>Gerir Estados</span>
            </button>

            {/* Import Lines Button */}
            <button
              type="button"
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 font-medium text-slate-700 border border-slate-200 shadow-2xs transition"
              title="Importar Texto via Caixa de Mensagem ou Ficheiro TXT"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Importar TXT</span>
            </button>

            {/* Backups Button */}
            <button
              type="button"
              onClick={onOpenBackups}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 font-medium text-slate-700 border border-slate-200 shadow-2xs transition"
              title="Ver histórico de backups diários"
            >
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span>Backups</span>
              {hasTodayBackup ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Backup diário de hoje guardado" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="A criar backup" />
              )}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-50 font-medium text-slate-700 border border-slate-200 shadow-2xs transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    Exportar JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleExportTxt}
                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    Exportar TXT
                  </button>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={onSaveManual}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                hasUnsavedChanges
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isSaving ? (
                <>
                  <Save className="w-3.5 h-3.5 animate-spin" />
                  <span>A guardar...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Guardado</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
