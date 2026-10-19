import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, saveProject, deleteProject } from '@/lib/storage';
import { Project } from '@/types/project';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await getProjectById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Projeto não encontrado' }, { status: 404 });
    }

    const updatedProject: Project = {
      ...existing,
      ...body,
      id, // protect id
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveProject(updatedProject);
    return NextResponse.json({ success: true, project: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await deleteProject(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Erro ao remover projeto' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Projeto e backups eliminados com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
