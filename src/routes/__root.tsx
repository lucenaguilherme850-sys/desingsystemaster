import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "@/components/ui/sonner";
import { CursorGlow } from "@/components/fx/CursorGlow";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { PerformanceDashboard } from "@/components/animmaster/PerformanceDashboard";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Design Master — Catálogo Premium de Assets UI Interativos" },
      {
        name: "description",
        content:
          "Explore mais de 300 componentes animados de alto nível: Shaders WebGL, Sliders, Scroll Animations e muito mais para sites premium.",
      },
      { property: "og:title", content: "Design Master — Catálogo Premium de Assets UI" },
      {
        property: "og:description",
        content:
          "O maior catálogo de componentes interativos premium para desenvolvedores e designers que buscam excelência visual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c8630442-f0d0-4844-ad76-0c6a3208ba0d/id-preview-b9391da4--63a45406-1556-4a66-a6b0-c4f85457edd2.lovable.app-1784307898269.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c8630442-f0d0-4844-ad76-0c6a3208ba0d/id-preview-b9391da4--63a45406-1556-4a66-a6b0-c4f85457edd2.lovable.app-1784307898269.png" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://animemaster.lovable.app",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/dm-logo.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Design Master",
          "url": "https://animemaster.lovable.app",
          "logo": "https://animemaster.lovable.app/dm-logo.png",
          "description": "Catálogo premium de componentes e efeitos interativos para web."
        })
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="dark bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAgent = pathname.startsWith("/agent");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const PUBLIC = ["/", "/auth", "/pricing", "/animmaster", "/assets"];
  const isPublic = PUBLIC.some((p) => pathname === "/" ? pathname === p : (pathname === p || pathname.startsWith(p + "/")));

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) navigate({ to: "/auth" });
  }, [user, loading, isPublic, navigate]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen flex flex-col">
        <CursorGlow />
        <PerformanceDashboard />
        <SiteHeader />
        <main className="relative z-10 flex-1">
          {!loading && !user && !isPublic ? (
            <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
              redirecionando para o login…
            </div>
          ) : (
            <Outlet />
          )}
        </main>
        {!isAgent && <SiteFooter />}
      </div>
      <Toaster theme="dark" />
    </QueryClientProvider>
  );
}
