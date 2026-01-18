import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON Görüntüleyici | API JSON Viewer",
  description: "API JSON verilerini kolayca görselleştirin. Collapsible TreeView ile JSON yapılarını inceleyin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  );
}
