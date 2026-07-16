import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Concursei Web',
  description: 'Gerencie seus estudos para concursos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
