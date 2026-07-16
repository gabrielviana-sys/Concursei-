import './globals.css'

export const metadata = {
  title: 'Concursei Web',
  description: 'Gerencie seus estudos para concursos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
