# Sistema de Autenticação Playpark

## Visão Geral

Sistema completo de autenticação com login, registro, logout e landing page.

## Páginas Criadas

### 1. Landing Page (`/landing`)

- **Localização**: `frontend/app/landing/page.tsx`
- **Funcionalidades**:
  - Hero section com CTAs para login/registro
  - Estatísticas (500+ parques, 1000+ usuários)
  - Seção de features (Explorar, Favoritos, Conquistas, Comunidade)
  - Showcase de badges de gamificação
  - Footer com links para download do app (App Store/Google Play)
  - Links rápidos para todas as páginas
  - Social media links

### 2. Página de Login (`/login`)

- **Localização**: `frontend/app/login/page.tsx`
- **Funcionalidades**:
  - Formulário de login (email + senha)
  - Validação de campos
  - Mensagens de erro
  - Opção "Lembrar-me"
  - Link para recuperação de senha
  - Botão "Continuar como Visitante"
  - Link para criar conta
  - Redirecionamento para `/app` após login bem-sucedido

### 3. Página de Registro (`/register`)

- **Localização**: `frontend/app/register/page.tsx`
- **Funcionalidades**:
  - Formulário completo (nome, email, senha, confirmar senha)
  - Validação em tempo real:
    - Nome obrigatório
    - Email válido
    - Senha mínimo 6 caracteres
    - Confirmação de senha
  - Indicadores visuais de requisitos de senha
  - Checkbox de termos de serviço
  - Link para login
  - Redirecionamento para `/app` após registro

### 4. Componente Footer (`components/Footer.tsx`)

- **Funcionalidades**:
  - Links para App Store e Google Play
  - Links rápidos (Explorar, Favoritos, Conquistas, Adicionar)
  - Seção de conta (Entrar, Criar Conta, Perfil, Suporte)
  - Links legais (Termos, Privacidade, Cookies, Contato)
  - Social media (Facebook, Instagram, Twitter)
  - Copyright

## Biblioteca de Autenticação

### Arquivo: `frontend/lib/auth.ts`

#### Funções Principais:

```typescript
// Verifica se usuário está logado
isLoggedIn(): boolean

// Retorna dados do usuário atual
getCurrentUser(): User | null

// Login com email/senha (simulado)
loginUser(email: string, password: string): Promise<{success: boolean, error?: string}>

// Registrar novo usuário
register(email: string, password: string, name?: string): Promise<{success: boolean, error?: string}>

// Logout
logout(): void

// Obtém ou cria ID de visitante
getOrCreateGuestUserId(): string
```

#### Storage (localStorage):

- `playpark_user_id` - ID do usuário
- `playpark_user_email` - Email do usuário
- `playpark_user_name` - Nome do usuário
- `playpark_is_logged_in` - Estado de login (true/false)

## Header Atualizado

### Arquivo: `frontend/components/Header.tsx`

**Novas funcionalidades**:

- Menu dropdown do usuário (quando logado)
- Exibe nome/email do usuário
- Botão de logout
- Link para configurações
- Botão "Entrar" (quando não logado)
- Click fora para fechar menu

## Footer Adicionado às Páginas

- ✅ `/favorites` - Página de favoritos
- ✅ `/gamification` - Página de conquistas
- ⏭️ `/app` - Não adicionado (página tem h-screen sem scroll)

## Fluxo de Autenticação

### Fluxo de Login:

1. Usuário acessa `/login`
2. Preenche email e senha
3. Clica em "Entrar"
4. Sistema valida credenciais
5. Armazena dados no localStorage
6. Redireciona para `/app`

### Fluxo de Registro:

1. Usuário acessa `/register`
2. Preenche nome, email, senha e confirmação
3. Sistema valida:
   - Nome não vazio
   - Email válido
   - Senha >= 6 caracteres
   - Senhas coincidem
4. Aceita termos de serviço
5. Cria conta
6. Armazena dados no localStorage
7. Redireciona para `/app`

### Fluxo de Logout:

1. Usuário logado clica no avatar/nome no header
2. Abre menu dropdown
3. Clica em "Sair"
4. Sistema limpa localStorage
5. Redireciona para `/landing`

## Modo Visitante

Usuários podem usar o app sem login:

- ID de visitante gerado automaticamente
- Favoritos e visitados salvos no localStorage
- Podem criar parques
- Podem usar todas as funcionalidades
- Opção "Continuar como Visitante" na página de login

## Próximos Passos (Opcional)

### Backend Real (Recomendado):

1. Criar rotas de autenticação no backend:

   - `POST /api/auth/register` - Registro
   - `POST /api/auth/login` - Login
   - `POST /api/auth/logout` - Logout
   - `GET /api/auth/me` - Obter usuário atual

2. Adicionar hash de senhas (bcrypt)
3. Implementar JWT tokens
4. Adicionar refresh tokens
5. Implementar recuperação de senha

### Melhorias UX:

1. Página de perfil (`/profile`)
2. Edição de dados do usuário
3. Alterar senha
4. Avatar do usuário
5. Verificação de email
6. OAuth (Google, Facebook, Apple)
7. Sessões persistentes
8. Remember me (cookies)

### Segurança:

1. Rate limiting
2. CSRF protection
3. Email verification
4. Two-factor authentication
5. Password strength meter
6. Session timeout

## Como Testar

### Teste 1: Landing Page

```
1. Acesse http://localhost:3000/landing
2. Verifique hero section
3. Role a página e veja features
4. Veja badges de gamificação
5. Veja footer com links de download
6. Clique em "Começar Agora" ou "Explorar Parques"
```

### Teste 2: Registro

```
1. Acesse http://localhost:3000/register
2. Preencha:
   - Nome: João Silva
   - Email: joao@teste.com
   - Senha: 123456
   - Confirmar: 123456
3. Aceite os termos
4. Clique em "Criar Conta"
5. Deve redirecionar para /app
6. Abra DevTools > Application > localStorage
7. Verifique playpark_user_* keys
```

### Teste 3: Login

```
1. Acesse http://localhost:3000/login
2. Preencha:
   - Email: qualquer@email.com
   - Senha: qualquer coisa (simulado)
3. Clique em "Entrar"
4. Deve redirecionar para /app
5. Veja nome/email no header (canto direito)
```

### Teste 4: Menu do Usuário

```
1. Com usuário logado em /app
2. Clique no nome/avatar no header
3. Veja menu dropdown com:
   - Nome e email
   - Configurações
   - Sair
4. Clique em "Sair"
5. Deve redirecionar para /landing
6. Header deve mostrar "Entrar" novamente
```

### Teste 5: Footer

```
1. Acesse /favorites
2. Role até o fim da página
3. Veja footer com:
   - Logo e descrição
   - Botões App Store/Google Play
   - Links rápidos
   - Links de conta
   - Links legais
   - Social media
```

### Teste 6: Modo Visitante

```
1. Acesse /login
2. Clique em "Continuar como Visitante"
3. Deve ir para /app
4. Pode usar todas as funcionalidades
5. Favoritos/visitados salvos no localStorage
```

## Estrutura de Arquivos

```
frontend/
├── app/
│   ├── landing/
│   │   └── page.tsx           # Landing page
│   ├── login/
│   │   └── page.tsx           # Página de login
│   ├── register/
│   │   └── page.tsx           # Página de registro
│   ├── favorites/
│   │   └── page.tsx           # (atualizado com footer)
│   └── gamification/
│       └── page.tsx           # (atualizado com footer)
├── components/
│   ├── Header.tsx             # (atualizado com menu usuário)
│   └── Footer.tsx             # Footer reutilizável
└── lib/
    └── auth.ts                # Biblioteca de autenticação
```

## Notas Importantes

1. **Autenticação Simulada**: Atualmente o login aceita qualquer email/senha. Para produção, integre com backend real.

2. **Storage Local**: Dados armazenados no localStorage (não seguro para produção). Use cookies httpOnly + JWT tokens em produção.

3. **Modo Visitante**: Sistema funciona sem login, criando ID temporário automaticamente.

4. **Responsivo**: Todas as páginas são mobile-friendly.

5. **SEO**: Landing page otimizada para busca.

6. **Download Links**: Links de App Store/Google Play são placeholders (#). Substitua pelos links reais quando o app móvel estiver publicado.

## Variáveis de Ambiente (Futuro)

Quando implementar backend real:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_password
```

## Comandos

```bash
# Iniciar frontend
cd frontend
npm run dev

# Build de produção
npm run build
npm start

# Testes
npm test
```

---

**Status**: ✅ Sistema de autenticação completo e funcional
**Última atualização**: Janeiro 2025
