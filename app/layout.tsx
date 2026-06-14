import "./globals.css";
import { AppNav } from "@/components/AppNav";
import { GlobalSettingsProvider } from "@/features/settings/GlobalSettingsProvider";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <GlobalSettingsProvider>
          <AppNav />
          {children}
        </GlobalSettingsProvider>
      </body>
    </html>
  );
}
