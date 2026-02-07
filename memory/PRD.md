# PRD - Gestão de Armazém de Construção Civil
## José Firmino

## 1. Visão Geral do Produto
Sistema de gestão de armazém para construção civil, permitindo o controlo de equipamentos, viaturas, materiais e obras. A aplicação oferece funcionalidades completas de CRUD, sistema de atribuição de recursos a obras com histórico de movimentos, alertas de manutenção por email e capacidade de importação/exportação de dados.

## 2. Requisitos Funcionais

### 2.1 Autenticação
- ✅ Login com email e password (JWT)
- ✅ Registo de novos utilizadores
- ✅ Proteção de rotas

### 2.2 Gestão de Equipamentos
- ✅ CRUD completo (criar, ler, atualizar, eliminar)
- ✅ Campos: código, descrição, marca, modelo, categoria, nº série, estado de conservação, foto
- ✅ Campos de documentação com **upload de PDF**: manual de utilizador, certificado de conformidade, ficha de manutenção
- ✅ Estado de manutenção: switch "Em Manutenção / Avariado" com descrição da avaria
- ✅ **Marcar manutenção na ficha** sem entrar em edição (botão direto na página de detalhe)
- ✅ **Indicadores de estado com cores**:
  - 🟢 Verde: Disponível em Armazém
  - 🟠 Laranja: Em Obra
  - 🔴 Vermelho: Em Manutenção / Oficina
- ✅ Atribuição direta a obras (sem entidade "Locais")
- ✅ Ficha de detalhe com histórico completo de movimentos
- ✅ Botão "Atribuir a Obra" diretamente na listagem
- ✅ Linhas clicáveis para abrir ficha
- ✅ Pesquisa avançada por código, descrição, marca, modelo, categoria e nº série
- ✅ Badge "Avariado" na listagem para equipamentos em manutenção

### 2.3 Gestão de Viaturas
- ✅ CRUD completo
- ✅ Campos: matrícula, marca, modelo, combustível, documento único, apólice de seguro
- ✅ Datas de vistoria e seguro com alertas
- ✅ Atribuição direta a obras
- ✅ Ficha de detalhe com histórico de movimentos e KMs
- ✅ Botão "Atribuir a Obra" diretamente na listagem
- ✅ Campos de documentação com **upload de PDF**: DUA (Doc. Único), Apólice de Seguro, Ficha IPO, Carta Verde, Manual do Veículo
- ✅ Estado de manutenção/oficina: switch "Em Oficina / Avariado" com descrição da avaria
- ✅ **Marcar em oficina na ficha** sem entrar em edição (botão direto na página de detalhe)
- ✅ **Editor inline da descrição da avaria** com ícone de edição
- ✅ **Indicadores de estado com cores**:
  - 🟢 Verde: Disponível em Armazém
  - 🟠 Laranja: Em Obra
  - 🔴 Vermelho: Em Oficina / Avariado
- ✅ **Datas importantes com alertas de expiração**: Seguro, IPO, Revisão, Vistoria
- ✅ Alertas calculados no backend para cada viatura
- ✅ Controlo de quilometragem (KMs atual e próxima revisão)

### 2.4 Gestão de Materiais
- ✅ CRUD completo
- ✅ Campos: código, descrição, unidade, stock atual, stock mínimo
- ✅ Alerta visual quando stock baixo
- ✅ Botões de Entrada/Saída diretamente na listagem
- ✅ Ficha de detalhe com histórico de movimentos

### 2.5 Gestão de Obras
- ✅ CRUD completo
- ✅ Campos: código, nome, endereço, cliente, estado (Ativa/Concluída/Pausada)
- ✅ Linhas clicáveis para abrir ficha de detalhe
- ✅ Página de detalhe mostrando recursos atribuídos
- ✅ Atribuir equipamentos diretamente na página da obra
- ✅ Atribuir viaturas diretamente na página da obra
- ✅ Registar movimentos de materiais (entrada/saída) para a obra
- ✅ Devolver recursos da obra

### 2.6 Sistema de Movimentos
- ✅ Movimentos de Ativos: atribuição e devolução de equipamentos/viaturas
- ✅ Movimentos de Stock: entradas e saídas de materiais
- ✅ Movimentos de Viaturas: registo de quilometragem
- ✅ Validação de dupla atribuição (não permite atribuir recurso já em obra)

### 2.7 Alertas e Notificações
- ✅ Sistema de alertas para vistoria/seguro de viaturas (via Resend)
- ✅ Dashboard com alertas visuais

### 2.8 Import/Export de Dados
- ✅ Exportar dados para Excel (.xlsx)
- ✅ Exportar relatório PDF
- ✅ Importar dados de ficheiro Excel

## 3. Design e Interface

### 3.1 Identidade Visual
- ✅ Logótipo José Firmino
- ✅ Tema escuro (preto #0a0a0a, cinza #262626, laranja #f97316)
- ✅ Tema claro (branco, cinza claro, laranja)
- ✅ Toggle de tema (sol/lua) no header
- ✅ Preferência guardada em localStorage

### 3.2 Layout
- ✅ Menu lateral colapsável
- ✅ Dashboard com estatísticas e alertas
- ✅ Tabelas com pesquisa e ações rápidas (desktop)
- ✅ Cards com ações rápidas (mobile)
- ✅ Formulários em modais

### 3.3 Responsividade
- ✅ Desktop: tabelas completas
- ✅ Tablet: layout adaptado
- ✅ Mobile: cards em vez de tabelas, menu lateral com hamburger

## 4. Arquitetura Técnica

### 4.1 Backend
- **Framework**: FastAPI
- **Base de dados**: MongoDB
- **Autenticação**: JWT
- **Upload de ficheiros**: local /uploads
- **Email**: Resend API

### 4.2 Frontend
- **Framework**: React
- **UI**: Shadcn/UI + TailwindCSS
- **Roteamento**: React Router
- **HTTP**: Axios
- **Notificações**: Sonner (toast)
- **Tema**: Context API + localStorage

### 4.3 Endpoints API
- `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- `/api/equipamentos`, `/api/equipamentos/{id}`
- `/api/viaturas`, `/api/viaturas/{id}`
- `/api/materiais`, `/api/materiais/{id}`
- `/api/obras`, `/api/obras/{id}`
- `/api/movimentos`, `/api/movimentos/atribuir`, `/api/movimentos/devolver`
- `/api/movimentos/stock`, `/api/movimentos/viaturas`
- `/api/export/pdf`, `/api/export/excel`
- `/api/import/excel`
- `/api/alerts/send`
- `/api/summary`

## 5. O Que Foi Implementado

### Sessão 07/02/2026 (Atual):
1. ✅ **Melhorias no Módulo de Viaturas** - Funcionalidades equivalentes ao módulo de Equipamentos:
   - Upload de PDFs para documentação (DUA, Seguro, IPO, Carta Verde, Manual)
   - Estado de manutenção/oficina com descrição da avaria
   - Botão "Marcar em Oficina" direto na página de detalhe (sem entrar em edição)
   - Botão "Marcar Disponível" para reverter estado
   - Editor inline da descrição da avaria com ícone de edição
   - Indicadores de estado com cores (verde/laranja/vermelho)
   - Datas de expiração com alertas visuais (Seguro, IPO, Revisão, Vistoria)
   - Barra de progresso para quilometragem até próxima revisão
   - Secção de documentação com links para PDFs carregados

### Sessão 06/02/2026:
1. ✅ **Relatórios Avançados**: Nova página com filtros por obra, mês e ano
   - Relatório de Movimentos de Ativos (equipamentos e viaturas)
   - Relatório de Consumo de Materiais (stock)
   - Relatório específico por Obra
2. ✅ **PWA (Progressive Web App)**: Aplicação pode ser instalada no telemóvel
   - manifest.json com ícones e configurações
   - Service worker para funcionamento offline básico
   - Meta tags para iOS e Android
3. ✅ **Página de Detalhe da Obra melhorada**:
   - Linhas clicáveis na lista de obras
   - Botão "Atribuir Equipamento" diretamente na página da obra
   - Botão "Atribuir Viatura" diretamente na página da obra
   - Botão "Movimento de Material" para registar consumo de stock
   - Tabs para ver equipamentos e viaturas atribuídos
   - Botão "Devolver" em cada recurso atribuído

### Sessão 30/01/2026:
1. ✅ Coluna "Foto" como primeira coluna na tabela de Viaturas
2. ✅ Nome da obra exibido no histórico de movimentos (Equipamentos e Viaturas)
3. ✅ Correção de cores dos inputs no modo claro (texto legível)
4. ✅ Backend enriquece movimentos com obra_nome e obra_codigo

### Sessões Anteriores:
1. ✅ Lançamento direto para obra nas páginas de Equipamentos/Viaturas/Materiais
2. ✅ Ficha de detalhe ao clicar na linha (linhas clicáveis)
3. ✅ Ficha de detalhe para Materiais (nova)
4. ✅ Modo Claro/Escuro com toggle no header
5. ✅ Otimização completa para mobile e tablet
6. ✅ Cards responsivos para mobile em vez de tabelas
7. ✅ Menu lateral responsivo com hamburger para mobile
8. ✅ Coluna "Foto" como primeira coluna na tabela de Equipamentos
9. ✅ Nova identidade visual com logótipo José Firmino
10. ✅ Remoção completa da entidade "Locais"
11. ✅ Sistema de movimentos (atribuir/devolver) com validação
12. ✅ Funcionalidade de Import/Export de dados (Excel e PDF)

## 6. Credenciais de Teste
- **Email**: test@test.com
- **Password**: test123

## 7. Próximos Passos (Backlog)

### P0 - Imediato:
- [x] Melhorias no módulo de Viaturas (documentação, manutenção, alertas) ✅ CONCLUÍDO

### P1 - Prioritário:
- [ ] Alertas automáticos por email para expiração de documentos (seguro, IPO) usando Resend
- [ ] Dashboard com gráficos de utilização
- [ ] Códigos de barras/QR codes para equipamentos e viaturas
- [ ] Notificações push no browser

### P2 - Futuro:
- [ ] Controlo de quilómetros detalhado para viaturas (registo em cada movimento)
- [ ] Histórico completo de manutenções (avarias passadas, custos, tempo de inatividade)
- [ ] Relatórios personalizáveis por período
- [ ] Gestão de utilizadores e permissões
- [ ] Refatoração do server.py em múltiplos ficheiros de rotas
