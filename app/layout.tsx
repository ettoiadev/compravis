import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CompraVis — Comparador de Preços para Comunicação Visual',
    template: '%s | CompraVis',
  },
  description:
    'Compare preços de materiais de comunicação visual entre fornecedores. Identifique rapidamente a opção mais barata para cada produto.',
  keywords: ['comparador de preços', 'comunicação visual', 'fornecedores', 'materiais gráficos'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="flex flex-col min-h-screen bg-slate-100 antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Navbar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}
