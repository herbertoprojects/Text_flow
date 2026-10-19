import { NextRequest, NextResponse } from 'next/server';
import { listProjects, saveProject } from '@/lib/storage';
import { Project } from '@/types/project';

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, lines = [], statuses } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ success: false, error: 'O nome do projeto é obrigatório' }, { status: 400 });
    }

    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const defaultStatuses = statuses && statuses.length > 0 ? statuses : [
      { id: 0, name: 'Inicial (Sem estado)', color: '#ffffff', textColor: '#0f172a' },
      { id: 1, name: 'Em Revisão', color: '#fef08a', textColor: '#713f12' },
      { id: 2, name: 'Aprovado', color: '#bbf7d0', textColor: '#14532d' },
      { id: 3, name: 'Atenção / Dúvida', color: '#fed7aa', textColor: '#7c2d12' },
    ];

    const project: Project = {
      id,
      name: name.trim(),
      description: description || '',
      createdAt: now,
      updatedAt: now,
      statuses: defaultStatuses,
      lines: Array.isArray(lines) ? lines : [],
    };

    const saved = await saveProject(project);
    return NextResponse.json({ success: true, project: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
