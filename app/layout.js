import './globals.css'

export const metadata = {
  title: 'Schulboard',
  description: 'Dein Schul-Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
