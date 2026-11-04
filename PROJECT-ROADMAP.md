# Design System Master — Plano Mestre de Execução

Última atualização: 2026-11-04
Repositório: lucenaguilherme850-sys/desingsystemaster
Branch de trabalho: main
Regra de trabalho: alterações diretas no GitHub; Lovable somente como preview. Preservar tudo que estiver fora do escopo de cada tarefa.

## Objetivo
Transformar a biblioteca em um produto rápido, estável, seguro, fácil de usar e financeiramente sustentável, sem reconstruir o projeto do zero nem adicionar efeitos antes de estabilizar o que já existe.

## Método obrigatório por fase
1. Diagnóstico baseado no código e, quando possível, em execução real.
2. Registrar riscos, dependências e critérios de aceite antes de mudanças estruturais.
3. Implementar em alterações pequenas e rastreáveis.
4. Validar com build, lint, testes e/ou verificação funcional aplicável.
5. Registrar commits, resultados, limitações e pendências neste documento.
6. Não declarar uma fase concluída sem evidência de validação. Não afirmar que o preview está atualizado sem confirmar.

## Fases e status

### Fase 1 — Diagnóstico técnico e desempenho
Status: EM ANDAMENTO
Escopo:
- Mapear arquitetura, rotas, componentes, hooks, funções server-side, migrations, Supabase e ativos de mídia.
- Medir build, tamanho dos bundles, carregamento inicial, LCP/INP/CLS, FPS e comportamento de vídeo.
- Auditar virtualização, lazy loading, fila de espelhamento, cache, concorrência, observers e limpeza de recursos.
- Identificar operações server-side públicas que possam gerar custo/abuso.
- Priorizar gargalos por impacto e risco antes de otimizar.

Constatações confirmadas na inspeção inicial de 2026-11-04:
- Repositório com 435 entradas na árvore Git e stack React 19, TypeScript, TanStack Start/Router, Vite 8, Supabase e React Query.
- A galeria já usa virtualização com @tanstack/react-virtual e cards montados por linhas; filtros atuais incluem categoria e somente efeitos ao vivo.
- MirrorCard mantém fila global com limite fixo de 4 tarefas; prioridade de hover foi implementada, mas a configuração maxConcurrent do preset não controla essa fila.
- O código atual de MirrorCard ainda usa rootMargin de 600px, backdrop blur, shadow hover e transição de 500ms. Portanto, os ajustes anteriores de 240px/transição reduzida não estão presentes na versão atualmente lida do arquivo.
- Os presets medium/high definem maxConcurrent 2, mas o consumidor da fila usa MAX_CONCURRENT=4 fixo. Configuração e execução estão divergentes.
- Preview high usa preload metadata e hoverOnly; low usa poster/sem preload. É necessário medir comportamento real antes de alterar novamente.
- O primeiro espelhamento de mídia ainda pode baixar arquivos do Google Drive e enviar ao Supabase Storage; isso é latência de origem, não apenas animação do card.
- A rota da galeria busca todos os registros de animmaster_items com select("*"). A virtualização reduz DOM montado, mas não reduz o payload inicial.
- A galeria não apresenta busca textual nem favoritos na implementação lida.
- PerformanceDashboard lê performance.memory e document.querySelectorAll('*') durante renderização; revisar frequência, compatibilidade e custo.
- Ainda não foram executados build, lint, Lighthouse, profiling de navegador ou testes de ponta a ponta nesta auditoria.

Critérios de aceite:
- Baseline de desempenho documentada em desktop e mobile.
- Gargalos ordenados por impacto e custo de correção.
- Nenhuma otimização declarada com base apenas em suposição.
- Build e lint sem novos erros causados pelas alterações.

### Fase 2 — Estabilidade, autenticação e segurança
Status: NÃO INICIADA
Escopo:
- Diagnosticar login, cadastro, confirmação de e-mail, recuperação, sessões e preview do Lovable.
- Revisar autorização server-side, RLS, policies, grants, service role e funções públicas.
- Auditar cotas grátis, bloqueio de abuso por dispositivo, emails descartáveis e consistência entre interface e banco.
- Revisar proteção de endpoints de espelhamento e operações que usam credenciais administrativas.
- Revisar acesso ao código-fonte, downloads, planos e sincronização de entitlement.

Riscos já identificados para investigação:
- A interface de preços ainda anuncia 3 amostras grátis, enquanto o hook e a função server-side definem cota 1.
- claimFreeUnlock faz uma consulta de contagem seguida de insert; essa sequência no servidor não é atômica por si só. A garantia definitiva deve estar no banco com constraint/trigger/função transacional.
- mirrorAnimmasterDrive usa supabaseAdmin e aceita slug via Server Function sem middleware de autenticação aparente no arquivo. Confirmar a exposição e aplicar controle de abuso/autorização apropriado antes de produção.
- A verificação de e-mail descartável não detecta idade de conta Gmail/Outlook; não alegar que existe verificação de idade de endereço.
- A storage policy pública para o bucket animmaster-assets precisa ser avaliada em conjunto com a sensibilidade dos objetos e o modelo de acesso esperado.

Critérios de aceite:
- Fluxos críticos de auth testados em preview e produção quando disponíveis.
- Regras de acesso impostas no servidor/banco, não apenas na UI.
- Cotas consistentes entre texto, hook, endpoint e banco.
- Nenhuma credencial privilegiada acessível ao cliente.

### Fase 3 — Experiência do usuário
Status: NÃO INICIADA
Escopo:
- Busca instantânea com debounce e filtros úteis (categoria, tecnologia, dificuldade, tipo de uso).
- Favoritos e histórico, persistidos de forma segura.
- Detalhes de componente com requisitos, dependências, compatibilidade, instruções e ações claras.
- Melhorar estados vazios, loading, erro, feedback de cópia/download e responsividade.
- Preservar a identidade visual atual.

Critérios de aceite:
- Fluxos testados com teclado, mouse e toque.
- Busca e filtros sem regressões na virtualização.
- Responsividade verificada em larguras mobile, tablet e desktop.

### Fase 4 — Agent AI
Status: NÃO INICIADA
Escopo:
- Entender arquitetura completa do agente, contexto por thread, ferramentas, catálogo real, anexos, limites e custos.
- Recomendar apenas componentes existentes e verificar dependências/compatibilidade.
- Separar direção visual, seleção de componentes, implementação e diagnóstico de erros.
- Evitar repetição, contexto excessivo e respostas que afirmem ações não realizadas.
- Definir limites, telemetria e fallback para falhas do provedor.

Critérios de aceite:
- Testes de conversas multi-turno, mudança de intenção, anexos, erro e retomada.
- Recomendações rastreáveis a itens reais do catálogo.
- Custos e limites observáveis.

### Fase 5 — Monetização
Status: NÃO INICIADA
Escopo:
- Rever preço vitalício versus custos recorrentes de armazenamento, tráfego, manutenção e IA.
- Definir limites explícitos de Agent Plus e política de uso justo.
- Formalizar pagamento, confirmação, concessão, expiração, renovação e revogação de acesso.
- Garantir que a UI de planos descreva exatamente o que o backend libera.
- Avaliar recuperação de pagamento e histórico do cliente.

Critérios de aceite:
- Matriz de benefícios consistente entre página, banco e autorização.
- Nenhum plano anunciado como automático quando a liberação for manual.
- Margem/custo por usuário estimados com dados reais.

### Fase 6 — Qualidade e escala
Status: NÃO INICIADA
Escopo:
- Auditar componentes individualmente: funcionamento, responsividade, dependências, acessibilidade, performance e qualidade do código.
- Classificar itens como verificado, precisa revisão ou experimental.
- Adicionar testes automatizados para fluxos essenciais.
- Revisar observabilidade, logs, backups, limites e operação.
- Só então planejar expansão do catálogo.

Critérios de aceite:
- Checklist técnico por componente.
- Testes essenciais automatizados.
- Processo de publicação e rollback documentado.

## Decisões e restrições permanentes
- GitHub é a fonte de edição/publicação; Lovable é usado como preview.
- Não usar o chat/agente do Lovable nem gastar créditos do Lovable para implementar.
- Não reescrever o projeto inteiro quando uma correção localizada resolver.
- Não remover efeitos ou mudar a identidade visual sem necessidade e sem explicar impacto.
- Não alterar banco de produção sem migration revisada e plano de aplicação/rollback.
- Sempre distinguir: código commitado, build validado, migration aplicada e preview atualizado. São estados diferentes.
- Registrar cada commit relevante e o resultado de validação na seção de histórico.

## Histórico de execução
### 2026-11-04 — Abertura do plano
- Inspeção inicial da árvore do repositório, package.json, galeria, MirrorCard, presets de preview, rotas de detalhe, autenticação, cota grátis, funções de mídia, dashboard de desempenho, preços e agente.
- Nenhuma alteração funcional foi feita nesta etapa.
- Próximo passo: concluir o inventário técnico e executar baseline de build/lint/performance antes de otimizações.
