import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compagnons | Un lien à protéger",
  description: "Un projet associatif étudiant pour prévenir les fugues et accompagner les propriétaires de chiens et de chats.",
  icons: {
    icon: "/companions-icon.svg",
    shortcut: "/companions-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
