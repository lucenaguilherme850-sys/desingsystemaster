# Plano de Organização de Acessos e Correção de Visibilidade

O objetivo deste plano é garantir que a liberação de planos (PRO e Agent Plus) funcione de forma automática, reativa e mutuamente exclusiva no painel de preços, além de resolver definitivamente o problema de visualização de código para usuários liberados.

## Ações Propostas

### 1. Inteligência no Painel de Preços (`src/components/animmaster/PricingSection.tsx`)
- Adaptar o painel para detectar o nível atual do usuário.
- Se o usuário já tiver o plano **PRO**, o botão para este plano será substituído por um status "Já Ativo" ou "Vitalício".
- Se o usuário já tiver o plano **Agent Plus**, o botão de assinatura será ocultado ou marcado como "Ativo".
- Isso evita que o usuário tente pagar por algo que já possui.

### 2. Sincronização em Tempo Real (`src/hooks/use-user-tier.ts`)
- Melhorar a detecção de mudanças nos papéis (`user_roles`) para que o frontend reaja instantaneamente assim que o administrador fizer a liberação no painel.
- Adicionar um listener de tempo real do Supabase para a tabela `user_roles`.

### 3. Hierarquia de Acesso e Código (`src/components/animmaster/FxSourceViewer.tsx`)
- Reforçar a lógica que exibe o código e o Prompt Mestre.
- Garantir que se o usuário for **PRO** (vitalício) ou **Agent Plus** (mensal), o conteúdo seja exibido sem necessidade de recarregar a página.
- Acesso Admin continuará sendo mestre (tem acesso a tudo).

### 4. Atualização das Regras do Agente
- Atualizar o texto das regras no `ChatPane.tsx` e no `component-spec.ts` conforme solicitado.

## Detalhes Técnicos

- **Hook `useUserTier`:** Utilizará `supabase.channel` para ouvir `INSERT` e `DELETE` na tabela `user_roles` filtrando pelo `user_id` logado.
- **Componente `PricingSection`:** Receberá o estado de `useUserTier` para renderizar condicionalmente os botões do WhatsApp.
- **Componente `LockedGate`:** Garantir que a lógica de "bloqueio" seja estritamente baseada no tier calculado em tempo real.

O acesso será validado tanto no banco quanto no estado reativo do React para eliminar o erro de "liberado mas não aparece".
