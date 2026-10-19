import fs from 'fs/promises';
import path from 'path';
import { Project, ProjectSummary, DailyBackup, AppSettings } from '@/types/project';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function ensureDirs(): Promise<void> {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  await fs.mkdir(BACKUPS_DIR, { recursive: true });
}

export async function checkDailyBackupExists(projectId: string, dateStr: string): Promise<boolean> {
  try {
    const backupPath = path.join(BACKUPS_DIR, projectId, `${dateStr}.json`);
    await fs.access(backupPath);
    return true;
  } catch {
    return false;
  }
}

export async function createDailyBackupIfMissing(project: Project): Promise<boolean> {
  const today = getTodayDateStr();
  const projectBackupDir = path.join(BACKUPS_DIR, project.id);
  await fs.mkdir(projectBackupDir, { recursive: true });

  const backupFilePath = path.join(projectBackupDir, `${today}.json`);
  try {
    await fs.access(backupFilePath);
    // Already exists for today
    return false;
  } catch {
    // Does not exist, create daily backup
    await fs.writeFile(backupFilePath, JSON.stringify(project, null, 2), 'utf-8');
    return true;
  }
}

const SEED_PROJECT: Project = {
  id: 'proj_demo_01',
  name: 'Conto de Exemplo - Revisão de Tradução',
  description: 'Projeto demonstrativo de teste com linhas e estados RGB.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  statuses: [
    { id: 0, name: 'Inicial (Sem alteração)', color: '#ffffff', textColor: '#0f172a' },
    { id: 1, name: 'Em Revisão', color: '#fef08a', textColor: '#713f12' },
    { id: 2, name: 'Aprovado / Final', color: '#bbf7d0', textColor: '#14532d' },
    { id: 3, name: 'Dúvida de Tradução', color: '#fed7aa', textColor: '#7c2d12' },
    { id: 4, name: 'Corrigir Sintaxe', color: '#fecdd3', textColor: '#881337' },
  ],
  lines: [
    { text: 'CAPÍTULO I — O DESPERTAR NA COLINA', status: 2 },
    { text: '', status: 0 },
    { text: 'A névoa matinal cobria os pinhais como um manto prateado e silencioso.', status: 2 },
    { text: 'Lucas ajustou a mochila de couro aos ombros e olhou para o vale distante.', status: 2 },
    { text: 'O relógio da torre central começou a soar seis badaladas graves.', status: 1 },
    { text: 'Cada nota vibrava no ar frio de outono, ecoando pelas pedras da muralha.', status: 1 },
    { text: 'Ele sabia que aquela seria a sua última oportunidade de cruzar a fronteira.', status: 0 },
    { text: 'Nos bolsos levava apenas uma bússola de latão e um bilhete escrito à pressa.', status: 3 },
    { text: '"Encontra o barqueiro no ancoradouro sul antes que a maré alta desapareça."', status: 3 },
    { text: 'As palavras pareciam queimar através do papel fino.', status: 0 },
    { text: '', status: 0 },
    { text: 'CAPÍTULO II — O CAMINHO DA FLORESTA', status: 0 },
    { text: '', status: 0 },
    { text: 'Os passos nas folhas húmidas faziam um estalido contínuo e compassado.', status: 1 },
    { text: 'À esquerda, o riacho corria com vigor renovado pelas chuvas recentes.', status: 1 },
    { text: 'Um corvo levantou voo de um carvalho secular, quebrando o silêncio.', status: 0 },
    { text: 'Lucas parou instantaneamente, agachando-se atrás de um rochedo coberto de musgo.', status: 4 },
    { text: 'Dois guardas da patrulha florestal conversavam em voz baixa na encruzilhada.', status: 4 },
    { text: 'Um deles segurava uma lanterna apagada; o outro examinava marcas no solo.', status: 1 },
    { text: 'O tempo parecia suspenso enquanto os dois homens decidiam o rumo a tomar.', status: 0 },
    { text: 'Finalmente, seguiram pelo trilho que subia para a torre de vigia.', status: 2 },
    { text: 'O rapaz soltou o ar que prendia nos pulmões e retomou a descida cautelosa.', status: 2 },
    { text: '', status: 0 },
    { text: 'CAPÍTULO III — O ENCONTRO NO CAIS', status: 0 },
    { text: '', status: 0 },
    { text: 'O cheiro a salitre e a madeira molhada anunciou a proximidade do estuário.', status: 0 },
    { text: 'No cais de tábuas escuras balouçava uma pequena traineira verde-escura.', status: 1 },
    { text: 'Um vulto encapuzado fumava um cachimbo encostado a um poste de amarração.', status: 3 },
    { text: '— É o Lucas? — perguntou uma voz rouca e habituada aos ventos marítimos.', status: 3 },
    { text: '— Trago a mensagem da Colina do Norte — respondeu ele, mostrando o bilhete.', status: 2 },
    { text: 'O homem assentiu com um aceno curto e estendeu uma mão calejada.', status: 2 },
    { text: '— Sobe a bordo. A maré não espera por fugitivos nem por sonhadores.', status: 2 },
    { text: 'Com um impulso firme, o barco afastou-se das estacas de madeira carcomida.', status: 2 },
    { text: 'Para trás ficavam as colinas sombrias; em frente, o horizonte infindo.', status: 2 },
  ],
};

export async function listProjects(): Promise<ProjectSummary[]> {
  await ensureDirs();
  const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
  const jsonFiles = entries.filter(e => e.isFile() && e.name.endsWith('.json'));

  if (jsonFiles.length === 0) {
    // Seed initial project
    await saveProject(SEED_PROJECT);
    jsonFiles.push({ name: `${SEED_PROJECT.id}.json`, isFile: () => true } as any);
  }

  const summaries: ProjectSummary[] = [];
  const today = getTodayDateStr();

  for (const file of jsonFiles) {
    try {
      const filePath = path.join(PROJECTS_DIR, file.name);
      const content = await fs.readFile(filePath, 'utf-8');
      const project: Project = JSON.parse(content);
      const hasTodayBackup = await checkDailyBackupExists(project.id, today);

      summaries.push({
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: project.updatedAt || new Date().toISOString(),
        lineCount: Array.isArray(project.lines) ? project.lines.length : 0,
        hasTodayBackup,
        statusesCount: Array.isArray(project.statuses) ? project.statuses.length : 0,
      });
    } catch (err) {
      console.error(`Error reading project file ${file.name}:`, err);
    }
  }

  return summaries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getProjectById(id: string): Promise<Project | null> {
  await ensureDirs();
  const filePath = path.join(PROJECTS_DIR, `${id}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const project: Project = JSON.parse(content);
    // User requirement: "este ficheiro tem um backup diario, ou seja quabro o projeto se naquele dia não tem backup ele cria backup"
    await createDailyBackupIfMissing(project);
    return project;
  } catch {
    return null;
  }
}

export async function saveProject(project: Project): Promise<Project> {
  await ensureDirs();
  project.updatedAt = new Date().toISOString();
  if (!project.createdAt) {
    project.createdAt = project.updatedAt;
  }
  // Ensure status 0 exists
  if (!project.statuses || project.statuses.length === 0) {
    project.statuses = [
      { id: 0, name: 'Inicial (Sem estado)', color: '#ffffff', textColor: '#0f172a' },
    ];
  } else if (!project.statuses.find(s => s.id === 0)) {
    project.statuses.unshift({ id: 0, name: 'Inicial (Sem estado)', color: '#ffffff', textColor: '#0f172a' });
  }

  // Ensure lines is array
  if (!Array.isArray(project.lines)) {
    project.lines = [];
  }

  const filePath = path.join(PROJECTS_DIR, `${project.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');

  // Also ensure today's backup exists
  await createDailyBackupIfMissing(project);

  return project;
}

export async function deleteProject(id: string): Promise<boolean> {
  await ensureDirs();
  const filePath = path.join(PROJECTS_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
    // Delete backups folder if exists
    const backupDir = path.join(BACKUPS_DIR, id);
    await fs.rm(backupDir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export async function listProjectBackups(projectId: string): Promise<DailyBackup[]> {
  await ensureDirs();
  const projectBackupDir = path.join(BACKUPS_DIR, projectId);
  try {
    const files = await fs.readdir(projectBackupDir);
    const backups: DailyBackup[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const dateStr = file.replace('.json', '');
        const filePath = path.join(projectBackupDir, file);
        const stats = await fs.stat(filePath);
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const data: Project = JSON.parse(content);
          backups.push({
            date: dateStr,
            filename: file,
            timestamp: stats.mtime.toISOString(),
            lineCount: Array.isArray(data.lines) ? data.lines.length : 0,
            sizeBytes: stats.size,
          });
        } catch {
          backups.push({
            date: dateStr,
            filename: file,
            timestamp: stats.mtime.toISOString(),
            lineCount: 0,
            sizeBytes: stats.size,
          });
        }
      }
    }

    return backups.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export async function restoreProjectBackup(projectId: string, dateStr: string): Promise<Project | null> {
  await ensureDirs();
  const backupFilePath = path.join(BACKUPS_DIR, projectId, `${dateStr}.json`);
  const projectFilePath = path.join(PROJECTS_DIR, `${projectId}.json`);

  try {
    const content = await fs.readFile(backupFilePath, 'utf-8');
    const project: Project = JSON.parse(content);
    project.updatedAt = new Date().toISOString();
    await fs.writeFile(projectFilePath, JSON.stringify(project, null, 2), 'utf-8');
    return project;
  } catch {
    return null;
  }
}

export async function getSettings(): Promise<AppSettings> {
  const defaultSettings: AppSettings = {
    hubProtocol: 'http',
    hubHost: 'localhost',
    hubPort: 80,
    linesPerPage: 500,
  };

  try {
    const content = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return { ...defaultSettings, ...JSON.parse(content) };
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  await ensureDirs();
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}
