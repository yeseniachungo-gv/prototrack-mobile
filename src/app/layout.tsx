import type { Metadata } from "next";
import "./globals.css";
import AppWrapper from "@/components/AppWrapper";

export const metadata: Metadata = {
  title: "GiraTempo",
  description: "Controle de Produção Inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="font-body antialiased">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
