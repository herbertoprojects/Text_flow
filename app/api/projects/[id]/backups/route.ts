import { NextRequest, NextResponse } from 'next/server';
import { listProjectBackups, restoreProjectBackup } from '@/lib/storage';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const backups = await listProjectBackups(id);
    return NextResponse.json({ success: true, backups });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { date } = await req.json();

    if (!date) {
      return NextResponse.json({ success: false, error: 'A data do backup é obrigatória' }, { status: 400 });
    }

    const restoredProject = await restoreProjectBackup(id, date);
    if (!restoredProject) {
      return NextResponse.json({ success: false, error: 'Backup não encontrado ou falha na restauração' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project: restoredProject });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
