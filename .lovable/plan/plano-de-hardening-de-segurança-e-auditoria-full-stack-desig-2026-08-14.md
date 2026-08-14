# Plano de Hardening de Segurança e Auditoria Full-Stack — Design Master

Este plano detalha a implementação do protocolo de segurança de 43 pontos solicitado, cobrindo autenticação, autorização, RLS, proteção de segredos e infraestrutura.

## Etapa 1: Reforço de Autenticação e RBAC
- [ ] **Políticas de Senha:** Configurar via console Lovable Cloud (mínimo 8 caracteres, caracteres especiais).
- [ ] **MFA:** Garantir suporte a Multi-Factor Authentication para contas administrativas.
- [ ] **Session Management:** Configurar expiração de sessão curta (1h) e refresh tokens seguros.
- [ ] **RBAC:** Auditar a tabela `user_roles` e a função `has_role`.
- [ ] **Proteção Admin:** Validar que `supabaseAdmin` é usado apenas em `*.server.ts` ou dentro de `.handler()` de `createServerFn`.

## Etapa 2: Segurança de Dados (PostgreSQL & RLS)
- [ ] **Auditoria RLS:** Verificar se 100% das tabelas (`animmaster_items`, `agent_threads`, `agent_messages`, `agent_reports`, `user_roles`, `assets`) possuem RLS habilitado.
- [ ] **GRANTs:** Assegurar que `GRANT ALL ON public.<table> TO service_role` e `GRANT SELECT ON public.<table> TO authenticated` (quando aplicável) existam.
- [ ] **Proteção de PII:** Garantir que logs não capturem e-mails ou dados sensíveis de usuários.
- [ ] **Encryption:** Verificar se dados sensíveis em repouso estão protegidos.

## Etapa 3: Proteção de API e Funções de Servidor
- [ ] **Input Validation:** Auditar todos os `.inputValidator()` usando Zod em `src/lib/*.functions.ts`.
- [ ] **CORS:** Configurar headers restritivos para domínios permitidos.
- [ ] **Rate Limiting:** Implementar no `chat-director.ts` e em rotas públicas de API.
- [ ] **Secret Management:** Mover todas as chaves de API externas para `process.env` lidos apenas no servidor.

## Etapa 4: Auditoria de Frontend
- [ ] **XSS:** Garantir ausência de `dangerouslySetInnerHTML` sem sanitização.
- [ ] **CSRF:** Validar proteção nativa do TanStack Start.
- [ ] **Security Headers:** Adicionar `Content-Security-Policy`, `X-Frame-Options`, `Strict-Transport-Security` via meta tags ou headers no Edge.
- [ ] **Sanitização de Código:** Auditar o componente `FxSourceViewer.tsx` para garantir que o código exibido não seja executado inadvertidamente no cliente.

## Etapa 5: Monitoramento e Resposta
- [ ] **PerformanceDashboard:** Restringir acesso exclusivamente ao admin via RLS na tabela de logs (se houver).
- [ ] **Error Reporting:** Auditar `lovable-error-reporting.ts` para evitar vazamento de stack traces em produção.

---
### Checklist do Protocolo DESIGNMASTER (Resumo)
- Autenticação Robusta (OAuth + MFA)
- RLS em 100% das Tabelas
- Zero Secrets no Frontend
- Validação Zod em Todos os Inputs
- Auditoria de Dependências (npm audit)
