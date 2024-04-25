'use client'

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import type {Metadata} from "next";
import "../styles/globals.css";

const queryClient = new QueryClient()
export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return (
      <html lang="en">
      <QueryClientProvider client={queryClient}>
        <body>{children}</body>
      </QueryClientProvider>
      </html>
  );
}
