import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kartik Bhatt — Data Analyst',
  description: 'Kartik Bhatt is a third-year B.Tech CSE (AI/ML) student from Lucknow, India, building clear insights with SQL, Python, and business intelligence.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
