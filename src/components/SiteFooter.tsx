import { Link } from "@tanstack/react-router";
import logo from "@/assets/dm-logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={logo.url} alt="Design Master" className="size-9 rounded-md object-contain" />
              <span className="text-[15px] font-semibold uppercase">
                Design<span className="text-neon-purple"> Master</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Coleção open-source de efeitos e componentes animados de alto nível —
              inspirada em designmaster.com.br e reactbits.dev.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Navegação
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="hover:text-neon">Effects</Link></li>
              <li><Link to="/animmaster" className="hover:text-neon">Design Master 280</Link></li>
              <li><a href="#pricing" className="hover:text-neon">Pricing</a></li>
              <li><a href="#faq" className="hover:text-neon">FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Links
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="https://designmaster.com.br"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neon"
                >
                  designmaster.com.br
                </a>
              </li>
              <li>
                <a
                  href="https://reactbits.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neon"
                >
                  reactbits.dev
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground md:flex-row md:items-center">
          <span>© Design Master · todos direitos reservados</span>
          <span>built with tanstack start · lovable cloud</span>
        </div>
      </div>
    </footer>
  );
}