import './globals.css'

export const metadata = {
  title: 'GydoHelper',
  description: 'Dein Schulboard für das Gymnasium Dornstetten',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
