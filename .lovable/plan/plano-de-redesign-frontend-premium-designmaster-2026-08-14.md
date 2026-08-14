# Plano de Redesign Frontend Premium — DesignMaster

Este plano detalha a implementação da nova camada visual, UX e motion design sobre a biblioteca existente de 280 componentes, seguindo as diretrizes do "Modo Construção".

## 🛠️ Fases de Implementação

### FASE 1: Auditoria Visual e Estrutural (Concluída)
- Mapeamento de componentes, layouts e padrões atuais.
- Identificação de inconsistências em espaçamentos, raios de borda e sombras.

### FASE 2: Design Tokens e Identidade Visual
- Consolidar sistema de cores neon green + electric purple sobre fundo pure black.
- Definir escala de tipografia (Display, Heading, Body) e espaçamento consistente.
- Padronizar Radius (raios de borda) e Shadows (profundidade).

### FASE 3: Motion System e Microinterações
- Implementar transições de entrada (Entrance) e interações de Hover/Press consistentes.
- Criar linguagem de movimento sofisticada (não obstrutiva).
- Otimizar animações para performance (Eco Mode).

### FASE 4: Component Shell e Cards Premium
- Criar o `<ComponentShell />` para envolver os componentes reais com metadados e ações.
- Desenvolver o novo design de card com previews interativos otimizados.

### FASE 5: Galeria e Navegação
- Melhorar filtros, busca e organização por categorias.
- Implementar virtualização avançada para lidar com os 280 itens sem perda de FPS.

### FASE 6: Página de Detalhes e Code Viewer
- Redesenhar a página individual do componente focando no Live Preview.
- Aprimorar o Code Viewer com sintaxe destacada e ações rápidas.

## 📐 Arquitetura Desejada
```text
DESIGN SYSTEM (Tokens)
      ↓
MOTION SYSTEM (Easings/Transitions)
      ↓
COMPONENT SHELLS (Wrappers)
      ↓
COMPONENTES EXISTENTES (280+)
```

## 🚀 Próximos Passos
1. Atualizar o `src/styles.css` com os novos tokens semânticos.
2. Refatorar a `LibraryIndex` em `src/routes/index.tsx` para adotar o novo layout de grid premium.
3. Atualizar o `MirrorCard.tsx` para o novo padrão visual.
