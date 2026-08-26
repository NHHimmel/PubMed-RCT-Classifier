import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PubMed RCT Classifier | BERT-Base Live Inference',
  description: 'Sequential sentence classification for randomized controlled trial abstracts using fine-tuned BERT-base on PubMed 20k RCT dataset.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200 antialiased">
        {children}
      </body>
    </html>
  );
}
