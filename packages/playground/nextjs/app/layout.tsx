import React from 'react';
import DevToolsWrapper from './DevToolsWrapper';

export const metadata = {
  title: 'Next.js Playground',
  description: 'Playground for React DevTools with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <DevToolsWrapper />
      </body>
    </html>
  );
}
