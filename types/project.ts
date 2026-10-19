export interface TextState {
  id: number;
  name: string;
  color: string; // RGB hex or rgb() string, e.g. #ffffff
  textColor?: string; // Optional contrast color
}

export interface LineItem {
  text: string;
  status: number; // references TextState.id
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  statuses: TextState[];
  lines: LineItem[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lineCount: number;
  hasTodayBackup: boolean;
  statusesCount: number;
}

export interface DailyBackup {
  date: string; // YYYY-MM-DD
  filename: string;
  timestamp: string;
  lineCount: number;
  sizeBytes: number;
}

export interface AppSettings {
  hubProtocol: 'http' | 'https';
  hubHost: string;
  hubPort: number; // 80, 443, or custom
  customUrl?: string;
  linesPerPage: number;
}
