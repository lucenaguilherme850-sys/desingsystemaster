# Dashboard do Agente - Reestruturação Visual

O objetivo é transformar a interface do agente em um **dashboard profissional**, otimizando o fluxo de trabalho entre conversa e documentação, com uma estética inspirada em centros de comando (dark mode neon).

## Mudanças na Interface (UI/UX)

1.  **Layout de 3 Colunas Redenhido**:
    *   **Coluna 1 (Projetos)**: Menu lateral estreito para alternar entre conversas.
    *   **Coluna 2 (Chat)**: Área central de mensagens focada, com cabeçalho de status do projeto.
    *   **Coluna 3 (Documento/Insights)**: Painel direito expandido por padrão, organizado em cartões modulares (widgets).

2.  **Widgets de Status (Dashboard)**:
    *   Substituir a lista simples de abas no painel direito por uma visualização de "Dashboard" que resume o progresso atual (Pipeline + Emoção + Perfil).
    *   Adicionar indicadores visuais de "Saúde do Projeto" (completude do briefing).

3.  **Chat com Contexto**:
    *   Adicionar um "Sticky Header" na área de chat que mostra o Perfil Criativo e Emoção-alvo ativos, mantendo o usuário alinhado com a estratégia.

## Detalhes Técnicos

*   **Componentes**:
    *   `AgentDashboardView`: Novo componente para a aba principal do painel direito.
    *   `StatusBadge`: Componente reutilizável para o status das fases do pipeline.
    *   `ProjectStats`: Widget para exibir métricas de fit e especialistas da coleção.
*   **Estilo**:
    *   Uso intensivo de transparências (`bg-card/20`), desfoque de fundo (`backdrop-blur`) e bordas sutis.
    *   Destaques em neon (verde/roxo) para estados ativos e conclusão de etapas.

## Experiência do Usuário

*   O usuário vê imediatamente o impacto de suas mensagens no dashboard à direita.
*   A alternância entre abas (Briefing, Mapa, Componentes) torna-se secundária à visão geral do dashboard.
