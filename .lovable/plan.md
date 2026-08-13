# Agent Dashboard - Estruturação e Organização

Simplificar a interface do agente, removendo redundâncias e tornando-a um dashboard prático para a geração do Prompt Mestre.

## UI / UX Enhancements

- **Reorganização de Abas**: Reduzir de 9 abas para 5 abas essenciais, movendo sub-seções para dentro de visões consolidadas.
  - `Dashboard` (Visão geral + Pipeline Trail)
  - `Direção` (Consolida Perfil, Matriz e Emoção)
  - `Coleção` (Lista de componentes selecionados + Alternativas + Acesso ao Prompt)
  - `Briefing` (Consolida Negócio, Marca, Público e Design System)
  - `Implementação` (Plano de ação passo-a-passo)
- **Dashboard Focado**: Transformar o Dashboard em um centro de comando com métricas de "Briefing Health" e "Pipeline Progress".
- **Prompt Master Workflow**: Criar um botão global ou seção destacada para "Gerar Prompt Mestre Consolidado" (do projeto inteiro) em vez de apenas por componente.

## Technical Details

- **src/components/agent/ReportPanel.tsx**:
  - Atualizar a constante `TABS` para refletir a nova estrutura simplificada.
  - Refatorar `ReportPanel` para mapear as novas abas.
  - Mesclar `DS` e `Brief` em uma única visualização.
  - Mesclar `Pipeline` e `Dashboard` (ou manter `Pipeline` apenas como um detalhe técnico).
  - Integrar a visualização de `Direction` com os dados de `Emotion`.
- **src/routes/api/chat-director.ts**:
  - Ajustar o `SYSTEM_BASE` para reforçar a estrutura organizada no `saveReport`.
- **Organização de Dados**:
  - Garantir que cada componente na aba `Coleção` tenha um resumo claro do *porquê* ele foi escolhido, facilitando ajustes manuais.

## Access Control

- Manter restrição: apenas usuários autenticados e com nível PRO/Agent Plus podem acessar as abas de Coleção e Implementação.
