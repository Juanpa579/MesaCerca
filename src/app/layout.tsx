import type { Metadata } from "next";

import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import "../styles/global.css";

export const metadata: Metadata = {
  title: "MesaCerca",
  description: "Encuentra restaurantes y reserva tu mesa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <div className="mc-app">
            <Header />

            <main className="mc-main">
              {children}
            </main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}