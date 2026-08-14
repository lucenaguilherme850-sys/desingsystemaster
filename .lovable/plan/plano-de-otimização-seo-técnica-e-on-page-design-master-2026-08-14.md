# Plano de Otimização SEO Técnica e On-Page — Design Master

Implementação de auditoria técnica completa e melhorias de SEO para o portal **Design Master**, focando em visibilidade, performance e acessibilidade.

## 1. Diagnóstico e Metas
*   **Estado Atual:** Metadados genéricos em várias rotas; ausência de robots.txt e sitemap.xml; faltam dados estruturados (JSON-LD) para produtos/componentes.
*   **Metas:** 90+ Score no Lighthouse SEO; meta tags únicas por página; indexação correta de 300+ componentes.

## 2. Implementação Técnica

### A. Metadados e Head Dinâmico
Atualização das rotas para incluir títulos otimizados e descrições semânticas:
- **Home (`/`):** Foco em "Design Master — Catálogo Premium de Assets UI Interativos".
- **Galeria 280 (`/animmaster`):** Foco em "300+ Componentes Animados PRO".
- **Detalhes (`/animmaster/$slug` e `/assets/$slug`):** Metadados dinâmicos usando o nome do componente + descrição técnica.
- **Global:** Configuração de Open Graph (og:image) e Twitter Cards.

### B. Infraestrutura SEO
- Criação de `public/robots.txt` permitindo indexação total (exceto `/agent` e `/admin`).
- Implementação de um gerador dinâmico de sitemap (ou arquivo estático inicial cobrindo as rotas principais e categorias).
- Adição de tags `canonical` no `__root.tsx` para evitar duplicação entre preview e produção.

### C. Dados Estruturados (JSON-LD)
Implementação de esquemas JSON-LD em `src/routes/__root.tsx` e páginas de detalhes:
- **Organization & WebSite:** Para a marca Design Master.
- **Product:** Para os componentes individuais (mesmo sendo assets digitais).
- **FAQ:** Para a seção de dúvidas frequentes.
- **BreadcrumbList:** Para facilitar a navegação estrutural.

### D. Conteúdo e Acessibilidade
- Auditoria de headings (H1, H2, H3) para garantir hierarquia lógica.
- Adição de `alt` dinâmico em imagens e placeholders.
- Tags ARIA e melhorias de contraste em elementos neon.

### E. Core Web Vitals
- Preload de fontes críticas (Inter/JetBrains Mono).
- Lazy loading agressivo de vídeos e Shaders fora da viewport.

## Detalhes Técnicos
- **Tecnologias:** TanStack Start v1 (head meta), JSON-LD (Schema.org).
- **Arquivos-chave:** `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/animmaster.index.tsx`, `src/routes/animmaster.$slug.tsx`.
