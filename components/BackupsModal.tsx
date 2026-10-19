'use client';

import React, { useState, useEffect } from 'react';
import { DailyBackup } from '@/types/project';
import { History, Download, RotateCcw, Calendar, X } from 'lucide-react';

interface BackupsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  onRestore: (date: string) => Promise<void>;
}

export default function BackupsModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onRestore,
}: BackupsModalProps) {
  const [backups, setBackups] = useState<DailyBackup[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringDate, setRestoringDate] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !projectId) return;

    const fetchBackups = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/backups`);
        const data = await res.json();
        if (data.success) {
          setBackups(data.backups || []);
        }
      } catch (err) {
        console.error('Failed to load backups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBackups();
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleRestore = async (date: string) => {
    const confirm = window.confirm(
      `Restaurar a versão do dia ${date}? As alterações atuais serão substituídas por esta cópia de segurança.`
    );
    if (!confirm) return;

    setRestoringDate(date);
    try {
      await onRestore(date);
      onClose();
    } finally {
      setRestoringDate(null);
    }
  };

  const handleDownload = async (date: string) => {
    try {
      const projectRes = await fetch(`/api/projects/${projectId}`);
      const projectData = await projectRes.json();
      const blob = new Blob([JSON.stringify(projectData.project, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}_backup_${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600 border border-teal-200">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Backups Diários</h2>
              <p className="text-xs text-slate-500">
                Histórico de snapshots diários de: <strong>{projectName}</strong>
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 bg-white text-xs">
          <p className="text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            A cada dia em que o projeto é acedido ou alterado, a app cria um ficheiro de backup diário em formato JSON.
          </p>

          {loading ? (
            <div className="py-10 text-center text-slate-400">A carregar backups...</div>
          ) : backups.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-1">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-600">Nenhum backup diário anterior registado.</p>
              <p className="text-[11px]">O snapshot diário é guardado automaticamente ao trabalhar no projeto.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((b) => {
                const isRestoring = restoringDate === b.date;
                return (
                  <div
                    key={b.date}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-800 font-mono">{b.date}</span>
                        <div className="text-[11px] text-slate-500">
                          {b.lineCount} linhas • {(b.sizeBytes / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownload(b.date)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-200 transition"
                        title="Descarregar ficheiro JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRestore(b.date)}
                        disabled={isRestoring}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restaurar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded hover:bg-slate-200 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
