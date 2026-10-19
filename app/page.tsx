'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Project, ProjectSummary, LineItem, TextState, AppSettings } from '@/types/project';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import LineListView from '@/components/LineListView';
import BottomRangeBar from '@/components/BottomRangeBar';
import RangeEditModal from '@/components/RangeEditModal';
import StatusManagerModal from '@/components/StatusManagerModal';
import ImportModal from '@/components/ImportModal';
import NewProjectModal from '@/components/NewProjectModal';
import BackupsModal from '@/components/BackupsModal';
import HubSettingsModal from '@/components/HubSettingsModal';
import { Loader2, Plus, FileText, Layers, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>({
    hubProtocol: 'http',
    hubHost: 'localhost',
    hubPort: 80,
    linesPerPage: 500,
  });

  // Pagination & Range Selection
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rangeStartLine, setRangeStartLine] = useState<number>(1);
  const [rangeEndLine, setRangeEndLine] = useState<number>(10);

  // Modals
  const [isRangeEditorOpen, setIsRangeEditorOpen] = useState(false);
  const [isStatusManagerOpen, setIsStatusManagerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isBackupsOpen, setIsBackupsOpen] = useState(false);
  const [isHubSettingsOpen, setIsHubSettingsOpen] = useState(false);

  // Backups modal context
  const [selectedBackupProjectId, setSelectedBackupProjectId] = useState<string>('');
  const [selectedBackupProjectName, setSelectedBackupProjectName] = useState<string>('');

  // Load specific project
  const loadProject = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.success && data.project) {
        setActiveProject(data.project);
        setHasUnsavedChanges(false);

        // Adjust default range for this project
        const count = data.project.lines.length;
        setRangeStartLine(1);
        setRangeEndLine(Math.min(count, 10));
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  }, []);

  // Load projects list and settings on mount
  const fetchProjectsAndSettings = useCallback(async (selectId?: string) => {
    try {
      const [projRes, setRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/settings'),
      ]);

      const projData = await projRes.json();
      const setData = await setRes.json();

      if (setData.success && setData.settings) {
        setSettings(setData.settings);
      }

      if (projData.success && projData.projects) {
        setProjects(projData.projects);

        // Select initial or requested project
        const targetId = selectId || projData.projects[0]?.id;
        if (targetId) {
          await loadProject(targetId);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [loadProject]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await fetchProjectsAndSettings();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [fetchProjectsAndSettings]);

  // Save active project to server
  const saveActiveProject = async (projectToSave?: Project): Promise<void> => {
    const proj = projectToSave || activeProject;
    if (!proj) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${proj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setActiveProject(data.project);
        setHasUnsavedChanges(false);

        // Update list summary
        setProjects((prev) =>
          prev.map((p) =>
            p.id === proj.id
              ? {
                  ...p,
                  name: data.project.name,
                  lineCount: data.project.lines.length,
                  updatedAt: data.project.updatedAt,
                  hasTodayBackup: true,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('Erro ao guardar o projeto. Verifique a consola.');
    } finally {
      setIsSaving(false);
    }
  };

  // Create new project
  const handleCreateProject = async (name: string, description: string, lines: LineItem[]) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, lines }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setActiveProject(data.project);
        await fetchProjectsAndSettings(data.project.id);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  // Delete project
  const handleDeleteProject = async (id: string, name: string) => {
    const confirm = window.confirm(`Tem a certeza que deseja eliminar o projeto "${name}" e todos os seus backups diários?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const remaining = projects.filter((p) => p.id !== id);
        setProjects(remaining);
        if (activeProject?.id === id) {
          if (remaining.length > 0) {
            await loadProject(remaining[0].id);
          } else {
            setActiveProject(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  // Rename project
  const handleRenameProject = async (id: string, currentName: string) => {
    const newName = window.prompt('Introduza o novo nome do projeto:', currentName);
    if (!newName || newName.trim() === '' || newName === currentName) return;

    if (activeProject && activeProject.id === id) {
      const updated = { ...activeProject, name: newName.trim() };
      setActiveProject(updated);
      await saveActiveProject(updated);
    } else {
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        if (data.success && data.project) {
          const updated = { ...data.project, name: newName.trim() };
          await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          });
          setProjects((prev) =>
            prev.map((p) => (p.id === id ? { ...p, name: newName.trim() } : p))
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Update line status inline
  const handleUpdateLineStatus = (lineIndex: number, newStatus: number) => {
    if (!activeProject) return;
    const updatedLines = [...activeProject.lines];
    if (updatedLines[lineIndex]) {
      updatedLines[lineIndex] = {
        ...updatedLines[lineIndex],
        status: newStatus,
      };
      const updatedProject = { ...activeProject, lines: updatedLines };
      setActiveProject(updatedProject);
      setHasUnsavedChanges(true);
      // Auto-save
      saveActiveProject(updatedProject);
    }
  };

  // Save new statuses
  const handleSaveStatuses = async (newStatuses: TextState[]) => {
    if (!activeProject) return;
    const validIds = new Set(newStatuses.map((s) => s.id));
    // Any line that has a removed status defaults back to 0
    const updatedLines = activeProject.lines.map((l) =>
      validIds.has(l.status) ? l : { ...l, status: 0 }
    );

    const updated = {
      ...activeProject,
      statuses: newStatuses,
      lines: updatedLines,
    };
    setActiveProject(updated);
    await saveActiveProject(updated);
  };

  // Import lines (replace or append)
  const handleImportLines = async (newLines: LineItem[], mode: 'replace' | 'append') => {
    if (!activeProject) return;
    let finalLines: LineItem[] = [];
    if (mode === 'replace') {
      finalLines = newLines;
    } else {
      finalLines = [...activeProject.lines, ...newLines];
    }

    const updated = { ...activeProject, lines: finalLines };
    setActiveProject(updated);
    await saveActiveProject(updated);

    // Reset range selection
    setRangeStartLine(1);
    setRangeEndLine(Math.min(finalLines.length, 10));
  };

  // Save Range Editor alterations (replaces slice and preserves page!)
  const handleSaveRange = async (
    newItems: LineItem[],
    startIdx: number,
    deleteCount: number
  ) => {
    if (!activeProject) return;

    // Preserved page as requested:
    // "quando guardo o texto é que é feito esse calculo e quando volto ao texto ele ostra a pagina que estava (das 500) linhas"
    const savedPage = currentPage;

    const updatedLines = [...activeProject.lines];
    updatedLines.splice(startIdx, deleteCount, ...newItems);

    const updated = { ...activeProject, lines: updatedLines };
    setActiveProject(updated);
    await saveActiveProject(updated);

    // Keep page, but clamp if total pages decreased
    const linesPerPage = settings.linesPerPage || 500;
    const maxPages = Math.max(1, Math.ceil(updatedLines.length / linesPerPage));
    const targetPage = Math.min(savedPage, maxPages);
    setCurrentPage(targetPage);

    // Update range selector to focus on the newly inserted area
    const newStart = startIdx + 1;
    const newEnd = Math.max(newStart, startIdx + newItems.length);
    setRangeStartLine(newStart);
    setRangeEndLine(Math.min(updatedLines.length, newEnd));
  };

  // Restore daily backup
  const handleRestoreBackup = async (date: string) => {
    if (!activeProject) return;
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/backups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setActiveProject(data.project);
        setHasUnsavedChanges(false);
        setCurrentPage(1);
        setRangeStartLine(1);
        setRangeEndLine(Math.min(data.project.lines.length, 10));
      }
    } catch (err) {
      console.error('Failed to restore backup:', err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Quick select current page range
  const handleSelectCurrentPageRange = () => {
    if (!activeProject) return;
    const linesPerPage = settings.linesPerPage || 500;
    const start = (currentPage - 1) * linesPerPage + 1;
    const end = Math.min(activeProject.lines.length, currentPage * linesPerPage);
    setRangeStartLine(start);
    setRangeEndLine(end);
  };

  // Compute status counts for the active project
  const lineCountByStatus = React.useMemo(() => {
    const counts: Record<number, number> = {};
    if (!activeProject) return counts;
    for (const item of activeProject.lines) {
      counts[item.status] = (counts[item.status] || 0) + 1;
    }
    return counts;
  }, [activeProject]);

  const activeProjectSummary = projects.find((p) => p.id === activeProject?.id);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-medium">A carregar TextFlow & Projetos...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-slate-800 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        project={activeProject}
        settings={settings}
        onOpenHubSettings={() => setIsHubSettingsOpen(true)}
        onOpenStatusManager={() => setIsStatusManagerOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenBackups={() => {
          if (activeProject) {
            setSelectedBackupProjectId(activeProject.id);
            setSelectedBackupProjectName(activeProject.name);
            setIsBackupsOpen(true);
          }
        }}
        onSaveManual={() => saveActiveProject()}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        hasTodayBackup={activeProjectSummary?.hasTodayBackup ?? true}
      />

      {/* Main Workspace: Sidebar + Line List Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Projects List */}
        <Sidebar
          projects={projects}
          activeProjectId={activeProject?.id || null}
          onSelectProject={(id) => loadProject(id)}
          onOpenNewProjectModal={() => setIsNewProjectOpen(true)}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
          onOpenBackups={(id, name) => {
            setSelectedBackupProjectId(id);
            setSelectedBackupProjectName(name);
            setIsBackupsOpen(true);
          }}
        />

        {/* Central Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
          {activeProject ? (
            <>
              {/* Clean Project Header & Legend */}
              <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{activeProject.name}</span>
                    <span className="text-xs font-mono font-normal text-slate-500">
                      ({activeProject.lines.length} linhas)
                    </span>
                  </h1>
                  {activeProject.description && (
                    <p className="text-[11px] text-slate-500 truncate max-w-lg mt-0.5">
                      {activeProject.description}
                    </p>
                  )}
                </div>

                {/* Status legend with colors on top */}
                <div className="flex items-center gap-2 overflow-x-auto py-0.5">
                  <span className="text-[11px] text-slate-400 font-medium">Legenda de Cores:</span>
                  {activeProject.statuses.map((s) => {
                    const count = lineCountByStatus[s.id] || 0;
                    const isWhite = !s.color || s.color.toLowerCase() === '#ffffff' || s.color.toLowerCase() === '#fff';
                    return (
                      <div
                        key={s.id}
                        className="px-2 py-0.5 rounded-md text-[11px] border flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                        style={{
                          backgroundColor: isWhite ? '#f8fafc' : s.color,
                          borderColor: isWhite ? '#e2e8f0' : 'rgba(0,0,0,0.1)',
                          color: '#0f172a',
                        }}
                        title={`Estado ${s.id}: ${s.name} (${count} linhas)`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="font-medium text-slate-800">{s.name}</span>
                        <span className="text-slate-500 font-mono text-[10px]">({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 500-Line Paginated List View */}
              <LineListView
                lines={activeProject.lines}
                statuses={activeProject.statuses}
                currentPage={currentPage}
                linesPerPage={settings.linesPerPage || 500}
                onPageChange={(page) => setCurrentPage(page)}
                onUpdateLineStatus={handleUpdateLineStatus}
                onSetRangeStart={(num) => setRangeStartLine(num)}
                onSetRangeEnd={(num) => setRangeEndLine(num)}
                selectedStartLine={rangeStartLine}
                selectedEndLine={rangeEndLine}
              />

              {/* Bottom Range Bar for editing intervals */}
              <BottomRangeBar
                totalLines={activeProject.lines.length}
                startLine={rangeStartLine}
                endLine={rangeEndLine}
                onChangeStartLine={(val) => setRangeStartLine(val)}
                onChangeEndLine={(val) => setRangeEndLine(val)}
                onOpenRangeEditor={() => setIsRangeEditorOpen(true)}
                currentPage={currentPage}
                linesPerPage={settings.linesPerPage || 500}
                onSelectCurrentPageRange={handleSelectCurrentPageRange}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 bg-white">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">Nenhum projeto selecionado</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Crie um novo projeto ou selecione um existente no menu à esquerda para visualizar e gerir o texto.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewProjectOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Criar Projeto
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Popups & Modals */}
      {isRangeEditorOpen && activeProject && (
        <RangeEditModal
          isOpen={isRangeEditorOpen}
          onClose={() => setIsRangeEditorOpen(false)}
          startLine={rangeStartLine}
          endLine={rangeEndLine}
          originalLines={activeProject.lines}
          statuses={activeProject.statuses}
          onSaveRange={handleSaveRange}
          currentPage={currentPage}
        />
      )}

      {isStatusManagerOpen && activeProject && (
        <StatusManagerModal
          isOpen={isStatusManagerOpen}
          onClose={() => setIsStatusManagerOpen(false)}
          statuses={activeProject.statuses}
          onSaveStatuses={handleSaveStatuses}
          lineCountByStatus={lineCountByStatus}
        />
      )}

      {isImportOpen && activeProject && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onImportLines={handleImportLines}
          currentLineCount={activeProject.lines.length}
        />
      )}

      {isNewProjectOpen && (
        <NewProjectModal
          isOpen={isNewProjectOpen}
          onClose={() => setIsNewProjectOpen(false)}
          onCreateProject={handleCreateProject}
        />
      )}

      {isBackupsOpen && (
        <BackupsModal
          isOpen={isBackupsOpen}
          onClose={() => setIsBackupsOpen(false)}
          projectId={selectedBackupProjectId}
          projectName={selectedBackupProjectName}
          onRestore={handleRestoreBackup}
        />
      )}

      {isHubSettingsOpen && (
        <HubSettingsModal
          isOpen={isHubSettingsOpen}
          onClose={() => setIsHubSettingsOpen(false)}
          settings={settings}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
