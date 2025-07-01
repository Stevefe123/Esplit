// app/layout.js
import './globals.css'

export default function RootLayout({ children }: {
  children: React.ReactNode // <-- THIS IS THE FIX
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">{children}</body>
    </html>
  )
}