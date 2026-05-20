# Portal Feira Livre 🍏🛒

Este projeto é um portal moderno para o comércio local e feiras livres, projetado para conectar feirantes e produtores locais aos seus clientes de forma ágil, segura e intuitiva. 

Este repositório foi reestruturado para ser um **código essencial e limpo no GitHub**, organizando as regras de segurança e o fluxo de inicialização sem modificar a lógica operacional do aplicativo.

---

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para baixar e rodar o projeto em sua máquina:

### Pre-requisitos
Certifique-se de ter instalado em seu computador:
- **Node.js** (versão 18 ou superior)
- **NPM** (gerenciador de pacotes incluso no Node.js)

### Passo 1: Instalar Dependências
No terminal da raiz do projeto, instale os módulos necessários:
```bash
npm install
```

### Passo 2: Configurar o Firebase
Crie uma conta e um projeto no console do Firebase:
1. Ative o **Firebase Authentication** com suporte a Login do Google (ou o método desejado).
2. Ative o **Cloud Firestore** em modo de produção.
3. No ambiente local, as credenciais já estão configuradas para o banco de dados do Applet. Caso queira usar as suas próprias credenciais no **Vercel** ou **Netlify**, basta cadastrar as seguintes Variáveis de Ambiente nas configurações do seu projeto na plataforma de Hospedagem:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_FIREBASE_FIRESTORE_DATABASE_ID` (Opcional, use caso use um banco nomeado)

### Passo 3: Executar em Modo de Desenvolvimento
Inicie o servidor local de desenvolvimento (unindo o servidor customizado Node/Express e o compilador rápido do Vite):
```bash
npm run dev
```
O projeto estará disponível no endereço indicado no terminal (por padrão, `http://localhost:3000`).

### Passo 4: Compilar de Forma Profissional para Produção
Para criar a pasta otimizada pronta para hospedagem:
```bash
npm run build
```
Esse comando irá compilar os arquivos estáticos do React em `dist/` e empacotar o backend `server.ts` de forma autocontida em `dist/server.cjs` para altíssima performance.

---

## 📂 Visão Geral da Arquitetura

O projeto adota uma arquitetura full-stack moderna dividindo-se entre:
- **Frontend SPA**: Desenvolvido em **React + Vite** com estilos utilitários via **Tailwind CSS** para máxima flexibilidade visual de layout.
- **Backend Integrado**: Um servidor **Node.js (Express)** no arquivo `server.ts`, configurado para entrega de recursos sob demanda de forma escalável.
- **Banco de Dados Relacional Serverless**: **Google Cloud Firestore** para persistência reativa em tempo real com login integrado.

---

## 🔒 Segurança do Banco de Dados (`firestore.rules`)

Seguindo o princípio de *Zero-Trust*, o arquivo `firestore.rules` protege cada tabela/coleção do banco de dados no nível de requisição. Ele foi documentado em português para facilitar sua auditoria quando o projeto for ao GitHub:

### Pilares de Segurança Adotados:
1. **Bloqueio Global Preventivo (Safety Net)**: Por padrão, todo acesso a qualquer documento não explicitado nas regras é sumariamente rejeitado (`if false`).
2. **Prevenção de Identidade Falsa (Spoofing)**: Operações críticas validam se o UID do usuário realmente condiz com o login registrado (`isOwner(...)`) e se o e-mail de administradores foi validado pelo Firebase (`email_verified == true`).
3. **Escrita Restrita (Controle Hierárquico)**:
   - **Visualizações Públicas**: Qualquer visitante pode ler dados públicos como produtos à venda (`/shops/{id}/products`), vagas de emprego (`/jobOpenings`) e avisos oficiais (`/notifications`).
   - **Gerenciamento de Lojas**: Um feirante só pode atualizar preços ou descrições da loja e produtos se for comprovadamente o proprietário (`isOwner(existing().ownerUid)`).
   - **Fluxo de Pedidos (`/orders`)**: Apenas o cliente que efetuou a compra ou o feirante recebedor do pedido possuem visibilidade sobre as faturas e conversas no chat (`/chatMessages`).

---

## 🛠️ Tecnologias Principais Empregadas
- **React 19 & TypeScript**: Linguagem fortemente tipada garantindo menos bugs de runtime.
- **Tailwind CSS**: Estilização enxuta baseada em utilitários visuais.
- **Vite & esbuild**: Geradores rápidos de feixes agregando e otimizando código e PWA offline.
- **Firebase SDK**: Sincronização automatizada offline de registros e autenticação.
