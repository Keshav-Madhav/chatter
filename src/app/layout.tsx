import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import ConvexClerkProvider from "@/providers/ConvexClerkProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chatter - Talk to your friends",
  description: "Chatter is a chat application that allows you to talk to your friends and place group calls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster richColors closeButton/>
          </ThemeProvider>
        </ConvexClerkProvider>
      </body>
    </html>
  );
}
