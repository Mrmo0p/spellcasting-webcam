import type {Metadata} from 'next';
import './globals.css';
export const metadata: Metadata={title:'Spellbound — Webcam Rune Duel',description:'Draw runes with your hand. Practice seven spells, duel an adaptive opponent, and explore webcam gesture recognition.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" className="dark"><body>{children}</body></html>}