import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'TextFlow - Gestor de Textos e Estados',
  description: 'Aplicação de gestão de escrita e revisão de textos por linhas com estados customizados RGB, paginação de 500 linhas, edição por intervalo, backups diários automáticos e integração com servidor Hub (portas 80/443).',
  openGraph: {
    title: 'TextFlow - Gestor de Textos e Estados',
    description: 'Aplicação de gestão de escrita e revisão de textos por linhas com estados customizados RGB, paginação de 500 linhas, backups diários e integração Hub.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TextFlow - Gestor de Textos e Estados',
    description: 'Aplicação de gestão de escrita e revisão de textos por linhas com estados customizados RGB.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
