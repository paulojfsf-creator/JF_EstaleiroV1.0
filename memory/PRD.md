# PRD - Gestão de Armazém de Construção Civil

## Problema Original
Criar uma aplicação de gestão de armazém de construção civil, com controlo de equipamentos, viaturas, materiais, locais e obras, com movimentos e resumos.

## User Personas
- **Gestor de Armazém**: Controla inventário, regista entradas/saídas de recursos
- **Responsável de Obra**: Visualiza recursos atribuídos às suas obras
- **Administrador**: Gestão completa do sistema, exportação de relatórios

## Core Requirements (baseado no Excel do utilizador)
- Autenticação JWT (login/registo)
- CRUD de Equipamentos (código, descrição, marca, modelo, data_aquisição, categoria, número_série, responsável, estado_conservação, foto, local)
- CRUD de Viaturas (matrícula, marca, modelo, combustível, data_vistoria, data_seguro, documento_único, apólice_seguro, observações, local)
- CRUD de Materiais (código, descrição, unidade, stock_atual, stock_mínimo, local)
- CRUD de Locais (código, nome, tipo: ARM/OFI/OBR/OBS, obra associada)
- CRUD de Obras (código, nome, endereço, cliente, estado)
- Movimentos de Ativos (saída/devolução de equipamentos)
- Movimentos de Stock (entrada/saída de materiais com atualização automática)
- Movimentos de Viaturas (registo de km e utilização)
- Alertas (stock baixo, vistoria/seguro a expirar)
- Notificações por email (Resend) para alertas de vistoria/seguro
- Upload de fotos para equipamentos e viaturas
- Exportação de relatórios (PDF/Excel)

## What's Been Implemented (Janeiro 2026)

### Backend (FastAPI + MongoDB)
- ✅ Autenticação JWT com bcrypt
- ✅ CRUD Equipamentos com todos os campos do Excel
- ✅ CRUD Viaturas com campos de vistoria e seguro
- ✅ CRUD Materiais com stock_atual e stock_minimo
- ✅ CRUD Locais com tipos (ARM, OFI, OBR, OBS)
- ✅ CRUD Obras com código
- ✅ Movimentos de Ativos (Saída/Devolução) com atualização de local
- ✅ Movimentos de Stock com atualização automática do stock
- ✅ Movimentos de Viaturas com tracking de km
- ✅ Alertas automáticos (stock baixo, vistoria/seguro - 7 dias antes)
- ✅ Upload de fotos (POST /api/upload)
- ✅ Notificações por email (Resend) para geral@josefirmino.pt
- ✅ Exportação PDF e Excel

### Frontend (React + Tailwind + Shadcn/UI)
- ✅ Página de Login/Registo
- ✅ Dashboard com resumos e alertas
- ✅ Gestão de Equipamentos (com upload de fotos)
- ✅ Gestão de Viaturas (com upload de fotos e botão Enviar Alertas)
- ✅ Gestão de Materiais (com stock atual/mínimo)
- ✅ Gestão de Locais (com tipos)
- ✅ Gestão de Obras (com código)
- ✅ Detalhe de Obra com recursos associados
- ✅ Movimentos de Ativos
- ✅ Movimentos de Stock
- ✅ Movimentos de Viaturas
- ✅ Página de Relatórios (PDF/Excel)
- ✅ Pesquisa em todas as tabelas
- ✅ Sidebar colapsável com menu de movimentos

## Technical Stack
- **Backend**: FastAPI, MongoDB, Motor, JWT, bcrypt, Resend
- **Frontend**: React 19, Tailwind CSS, Shadcn/UI, Axios
- **Export**: reportlab (PDF), openpyxl (Excel)
- **Email**: Resend (notificações de alertas)

## Configuração de Email
- Email de destino: geral@josefirmino.pt
- Alertas enviados: 7 dias antes da expiração
- Nota: Para enviar emails para domínios externos, é necessário verificar o domínio em resend.com/domains

## Next Tasks
1. Verificar domínio no Resend para envio de emails
2. Dashboard com gráficos de utilização
3. Sistema de códigos de barras/QR codes
4. Relatórios personalizáveis por período
