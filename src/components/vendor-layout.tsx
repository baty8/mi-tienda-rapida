import { ThemeProvider } from "./theme-provider";
import { Sidebar } from "./ui/sidebar";

export function VendorLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex min-h-screen w-full bg-muted/40">
                <Sidebar />
                <div className="flex flex-1 flex-col">
                    {children}
                </div>
            </div>
        </ThemeProvider>
    )
}
