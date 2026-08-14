# Plano de Otimização SEO Técnica Avançada e Monitoramento

Este plano detalha as melhorias de SEO on-page, acessibilidade e monitoramento técnico para o projeto **Design Master**. O objetivo é garantir indexação perfeita, alta performance (Core Web Vitals) e presença nos resultados de busca com dados estruturados ricos.

## Diagnóstico Técnico
- **Infraestrutura:** Sitemap e Robots.txt básicos implementados.
- **Metadados:** Implementados em rotas principais, mas precisam de refinamento semântico.
- **Heading Hierarchy:** Alguns componentes usam H1 e H3 sem uma sequência lógica clara (H2 ausentes em seções de conteúdo).
- **Acessibilidade:** Imagens em cards e detalhes precisam de textos `alt` mais descritivos baseados nos metadados dos componentes.
- **Monitoramento:** Google Search Console diagnosticado como desconectado via API direta.

## Ações de Implementação

### 1. Refinamento de Metadados e Headings
- **Home (`/`):** Ajustar hierarquia para incluir H1 (Logo/Nome) e H2 para seções (Filtros, Componentes).
- **Detalhes (`/animmaster/$slug`):** Garantir que o nome do componente seja H1 e que as subseções (Documentação, Relacionados) usem H2/H3 corretamente.
- **Assets Legados (`/assets/$slug`):** Sincronizar os metadados dinâmicos e JSON-LD para manter consistência com a galeria PRO.

### 2. Acessibilidade e SEO de Imagens
- **MirrorCard:** Atualizar o componente `GoogleDriveImage` para aceitar e exibir `alt` text vindo do banco de dados (prop `name` e `type_name`).
- **Lazy Loading:** Refinar a prioridade de carregamento (Eager para Hero, Lazy para o restante da grade).

### 3. Dados Estruturados (JSON-LD)
- Implementar `WebSite` JSON-LD na Home com funcionalidade de `potentialAction` para busca interna.
- Refinar `BreadcrumbList` em todas as páginas internas para melhorar os Rich Snippets.

### 4. Monitoramento e Performance
- Criar um guia técnico interno (ou página de status) para o usuário realizar a conexão manual do Search Console.
- Otimizar TTFB removendo renderizações desnecessárias durante o SSR de componentes que são puramente client-side.

## Detalhes Técnicos
- Uso de `react-helmet-async` (via TanStack `head` options) para injeção de meta tags.
- Esquemas de Schema.org validados conforme padrões 2026.
- Manutenção da compatibilidade com o "Eco Mode" já implementado para não prejudicar a performance em dispositivos móveis.
