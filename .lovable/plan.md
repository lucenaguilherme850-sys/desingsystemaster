# Auditoria e Melhoria de Performance

## Objetivos
1. Implementar painel de métricas (FPS, Memória, Load Time).
2. Limpar a rota index.tsx de textos de debug/instrução que vazaram para o código.
3. Auditar e garantir limpeza de listeners e loops de animação.

## Ações Realizadas
- Criado `src/hooks/use-performance-monitor.ts`: Hook para monitorar FPS e memória.
- Criado `src/components/animmaster/PerformanceDashboard.tsx`: UI colapsável para exibir métricas.
- Integrado `PerformanceDashboard` no `src/routes/__root.tsx`.

## Ações Pendentes
- Limpar `src/routes/index.tsx` de resquícios de texto.
- Auditar componentes críticos para garantir `IntersectionObserver` e cleanup de `requestAnimationFrame`.
