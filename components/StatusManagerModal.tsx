'use client';

import React, { useState } from 'react';
import { TextState } from '@/types/project';
import { getContrastTextColor, hexToRgb, rgbToHex } from '@/lib/colorUtils';
import { Palette, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface StatusManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  statuses: TextState[];
  onSaveStatuses: (newStatuses: TextState[]) => Promise<void>;
  lineCountByStatus: Record<number, number>;
}

const PRESET_PALETTES = [
  { name: 'Amarelo Claro', color: '#fef08a' },
  { name: 'Verde Menta', color: '#bbf7d0' },
  { name: 'Laranja Suave', color: '#fed7aa' },
  { name: 'Vermelho Claro', color: '#fecdd3' },
  { name: 'Azul Celeste', color: '#bae6fd' },
  { name: 'Roxo Lavanda', color: '#e9d5ff' },
  { name: 'Rosa Suave', color: '#fbcfe8' },
  { name: 'Cinzento Claro', color: '#e2e8f0' },
];

export default function StatusManagerModal({
  isOpen,
  onClose,
  statuses,
  onSaveStatuses,
  lineCountByStatus,
}: StatusManagerModalProps) {
  const [list, setList] = useState<TextState[]>(statuses);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#fef08a');
  const [rgbValues, setRgbValues] = useState<{ r: number; g: number; b: number }>({ r: 254, g: 240, b: 138 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleColorChange = (hex: string) => {
    setNewColor(hex);
    setRgbValues(hexToRgb(hex));
  };

  const handleRgbComponentChange = (component: 'r' | 'g' | 'b', value: number) => {
    const clamped = Math.max(0, Math.min(255, Number(value) || 0));
    const nextRgb = { ...rgbValues, [component]: clamped };
    setRgbValues(nextRgb);
    setNewColor(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b));
  };

  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const maxId = list.reduce((max, s) => Math.max(max, s.id), 0);
    const nextId = maxId + 1;

    const newStatus: TextState = {
      id: nextId,
      name: newName.trim(),
      color: newColor,
      textColor: getContrastTextColor(newColor),
    };

    setList([...list, newStatus]);
    setNewName('');
    setNewColor('#bae6fd');
    setRgbValues(hexToRgb('#bae6fd'));
  };

  const startEdit = (status: TextState) => {
    setEditingId(status.id);
    setEditName(status.name);
    setEditColor(status.color);
  };

  const saveEdit = (id: number) => {
    const updated = list.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          name: editName.trim() || s.name,
          color: id === 0 ? '#ffffff' : editColor,
          textColor: getContrastTextColor(id === 0 ? '#ffffff' : editColor),
        };
      }
      return s;
    });
    setList(updated);
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (id === 0) return;
    const affectedLines = lineCountByStatus[id] || 0;
    if (affectedLines > 0) {
      const confirm = window.confirm(
        `Existem ${affectedLines} linhas com este estado. Ao remover, estas linhas voltarão para o Estado 0 (Inicial). Deseja continuar?`
      );
      if (!confirm) return;
    }
    setList(list.filter((s) => s.id !== id));
  };

  const handleFinalSave = async () => {
    setSaving(true);
    try {
      await onSaveStatuses(list);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Estados e Cores RGB</h2>
              <p className="text-xs text-slate-500">Defina as cores dos estados das linhas do texto</p>
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
        <div className="p-6 space-y-5 overflow-y-auto bg-white text-xs">
          {/* List of current statuses */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Estados Atuais ({list.length})
            </span>

            <div className="space-y-1.5">
              {list.map((st) => {
                const count = lineCountByStatus[st.id] || 0;
                const isEditing = editingId === st.id;
                const contrastText = getContrastTextColor(st.color);

                return (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 gap-3"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className="w-7 h-7 rounded border border-black/15 shadow-2xs flex items-center justify-center font-bold font-mono text-xs shrink-0"
                        style={{ backgroundColor: st.color, color: contrastText }}
                      >
                        {st.id}
                      </div>

                      {isEditing ? (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 flex-1 focus:outline-hidden focus:border-blue-500"
                          />
                          {st.id !== 0 && (
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="w-7 h-7 rounded cursor-pointer border border-slate-300 bg-transparent"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => saveEdit(st.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 truncate">{st.name}</span>
                            {st.id === 0 && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                                Inicial
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {st.color.toUpperCase()} • {count} {count === 1 ? 'linha' : 'linhas'}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(st)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {st.id !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleDelete(st.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add state form */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <span className="font-semibold text-slate-700 block">
              + Adicionar Novo Estado
            </span>

            <form onSubmit={handleAddStatus} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Nome do Estado</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Aprovado, Dúvida, Em Tradução..."
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Cor RGB</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-md border border-slate-300">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="font-mono text-xs text-slate-600 px-1">{newColor}</span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <span className="text-slate-400">R:</span>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbValues.r}
                      onChange={(e) => handleRgbComponentChange('r', Number(e.target.value))}
                      className="w-10 bg-white border border-slate-300 rounded px-1 py-0.5 text-center"
                    />
                    <span className="text-slate-400">G:</span>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbValues.g}
                      onChange={(e) => handleRgbComponentChange('g', Number(e.target.value))}
                      className="w-10 bg-white border border-slate-300 rounded px-1 py-0.5 text-center"
                    />
                    <span className="text-slate-400">B:</span>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbValues.b}
                      onChange={(e) => handleRgbComponentChange('b', Number(e.target.value))}
                      className="w-10 bg-white border border-slate-300 rounded px-1 py-0.5 text-center"
                    />
                  </div>
                </div>

                {/* Preset colors */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {PRESET_PALETTES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => handleColorChange(p.color)}
                      className="px-2 py-0.5 text-[11px] rounded border border-black/10 transition hover:scale-105"
                      style={{ backgroundColor: p.color, color: getContrastTextColor(p.color) }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newName.trim()}
                className="w-full py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs transition disabled:opacity-50"
              >
                + Adicionar à Lista
              </button>
            </form>
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
            onClick={handleFinalSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition disabled:opacity-50"
          >
            {saving ? 'A guardar...' : 'Guardar Estados'}
          </button>
        </div>
      </div>
    </div>
  );
}
