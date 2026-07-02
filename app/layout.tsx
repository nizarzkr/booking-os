import "./globals.css";

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { theme } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Booking OS",
  description:
    "Le booking simplifié pour les artistes indépendants : sache qui relancer aujourd'hui pour décrocher plus de dates.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      {...mantineHtmlProps}
    >
      <head>
        {/* App dark-only : on force le scheme (ignore le localStorage/état résiduel). */}
        <ColorSchemeScript forceColorScheme="dark" />
      </head>
      <body>
        <MantineProvider theme={theme} forceColorScheme="dark">
          <Notifications />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
