// app/layout.tsx
import { ThemeProvider } from "next-themes";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import ModalProvider from "@/providers/modal-providers";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Webra",
  description: "All in one agency solution",
};
const font = DM_Sans({
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>
            {children}
            <Toaster />  
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
