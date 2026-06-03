import { Link, useLocation } from "wouter";
import { Film, Settings, LayoutDashboard } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Projects" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="w-16 flex flex-col items-center py-4 border-r border-border bg-card">
        <div className="mb-8 text-primary">
          <Film className="w-8 h-8" />
        </div>
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center p-2 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground relative group">
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
