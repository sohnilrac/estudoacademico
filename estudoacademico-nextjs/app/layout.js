export const metadata = {
  title: 'SONHO — Fichário de Samba',
  description: 'Catálogo pessoal de discos de vinil de samba',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
