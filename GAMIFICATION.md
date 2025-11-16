# 🏆 Sistema de Gamificação Playpark

## 📋 Visão Geral

Sistema completo de gamificação com badges, conquistas e tracking de parques visitados. Incentiva os usuários a explorarem mais parques e desbloquear conquistas.

---

## 🎯 Funcionalidades

### 1. **Sistema de Badges (Conquistas)**

| Badge                | Ícone | Tier     | Requisito   | Descrição                      |
| -------------------- | ----- | -------- | ----------- | ------------------------------ |
| Explorador Iniciante | 🎯    | Bronze   | 5 parques   | Visitou 5 parques diferentes   |
| Aventureiro          | 🏆    | Prata    | 10 parques  | Visitou 10 parques diferentes  |
| Veterano dos Parques | 👑    | Ouro     | 20 parques  | Visitou 20 parques diferentes  |
| Mestre dos Parques   | 💎    | Platina  | 50 parques  | Visitou 50 parques diferentes  |
| Lenda dos Parques    | ⭐    | Diamante | 100 parques | Visitou 100 parques diferentes |

### 2. **Tracking de Visitas**

- ✅ Botão "Já visitei" nos detalhes de cada parque
- ✅ Histórico de parques visitados
- ✅ Data de cada visita registrada
- ✅ Contagem total de visitas

### 3. **Página de Gamificação**

- ✅ Visualização de todas as conquistas
- ✅ Badges desbloqueados vs bloqueados
- ✅ Barra de progresso para próximo badge
- ✅ Estatísticas gerais (visitados, favoritos)
- ✅ Ícone de troféu no header

### 4. **Sistema de Progresso**

- ✅ Cálculo automático de progresso
- ✅ Notificação visual de conquista
- ✅ Contador de parques visitados

---

## 🏗️ Arquitetura

### Backend (MongoDB)

#### Modelo `User` - Campo `visited`

```javascript
visited: [
  {
    playgroundId: String, // ID do parque visitado
    visitedAt: Date, // Data da visita
  },
];
```

#### Rotas API

| Método | Endpoint                                         | Descrição                                  |
| ------ | ------------------------------------------------ | ------------------------------------------ |
| POST   | `/api/users/:userId/visited`                     | Marcar parque como visitado                |
| GET    | `/api/users/:userId/visited`                     | Listar todos os parques visitados          |
| GET    | `/api/users/:userId/visited/check/:playgroundId` | Verificar se parque foi visitado           |
| GET    | `/api/users/:userId/stats`                       | Obter estatísticas (visitados + favoritos) |

### Frontend

#### Arquivos Criados

1. **`lib/gamification.ts`** - Lógica de gamificação

   - Definição de badges
   - Cálculo de progresso
   - Funções de API (markAsVisited, isVisited, etc.)

2. **`app/gamification/page.tsx`** - Página de conquistas

   - Visualização de badges
   - Estatísticas
   - Progresso

3. **Componentes Atualizados:**
   - `MapComponent.tsx` - Botão "Já visitei"
   - `Header.tsx` - Ícone de troféu (gamificação)

---

## 🚀 Como Usar

### 1. **Marcar Parque como Visitado**

#### No Frontend (detalhes do parque):

```typescript
import { markAsVisited } from "@/lib/gamification";

// Marcar parque como visitado
const success = await markAsVisited("playground_123");

if (success) {
  console.log("Parque marcado como visitado!");
}
```

#### Via API direta:

```bash
curl -X POST http://localhost:5000/api/users/user_123/visited \
  -H "Content-Type: application/json" \
  -d '{"playgroundId": "playground_123"}'
```

### 2. **Verificar se Parque foi Visitado**

```typescript
import { isVisited } from "@/lib/gamification";

const visited = await isVisited("playground_123");
console.log(`Já visitei: ${visited}`); // true ou false
```

### 3. **Obter Estatísticas do Usuário**

```typescript
import { getUserStats } from "@/lib/gamification";

const stats = await getUserStats();
console.log(`Parques visitados: ${stats.visitedCount}`);
console.log(`Favoritos: ${stats.favoritesCount}`);
console.log(`Próximo badge: ${stats.progress.nextBadge?.name}`);
console.log(`Progresso: ${stats.progress.progress}%`);
```

### 4. **Calcular Progresso e Badges**

```typescript
import { calculateProgress, BADGES } from "@/lib/gamification";

const visitedCount = 7; // usuário visitou 7 parques

const progress = calculateProgress(visitedCount);

console.log(`Badges desbloqueados: ${progress.unlockedBadges.length}`);
console.log(`Próximo badge: ${progress.nextBadge?.name}`);
console.log(`Progresso: ${progress.progress}%`);
```

---

## 💻 Interface de Usuário

### Botão "Já visitei" no Detalhes do Parque

```tsx
// Estado inicial (não visitado)
┌──────────────────────────────────┐
│ [✓] Marcar como Visitado         │
└──────────────────────────────────┘

// Depois de visitar (visitado)
┌──────────────────────────────────┐
│ ✓ Já Visitei Este Parque         │
│ Parabéns! Este parque conta     │
│ para suas conquistas 🎉          │
└──────────────────────────────────┘
```

### Página de Gamificação (`/gamification`)

```
┌─────────────────────────────────────────┐
│  🏆 Conquistas                          │
├─────────────────────────────────────────┤
│                                         │
│  📊 Estatísticas                        │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  7   │  │  3   │  │ 1/5  │         │
│  │Visits│  │ Favs │  │Badges│         │
│  └──────┘  └──────┘  └──────┘         │
│                                         │
│  🎯 Próximo Objetivo                    │
│  Aventureiro - 10 parques               │
│  ████████░░ 70%                         │
│                                         │
│  🏅 Todas as Conquistas                 │
│  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │ 🎯  ✓  │  │ 🏆 (🔒)│  │ 👑 (🔒)│   │
│  │ Bronze │  │ Prata  │  │ Ouro   │   │
│  │Iniciante│  │Aventure│  │Veterano│   │
│  └────────┘  └───────┘  └────────┘   │
└─────────────────────────────────────────┘
```

---

## 🎨 Cores dos Tiers

```css
Bronze:   #CD7F32 (gradient: from-amber-700 to-amber-900)
Prata:    #C0C0C0 (gradient: from-gray-400 to-gray-600)
Ouro:     #FFD700 (gradient: from-yellow-400 to-yellow-600)
Platina:  #E5E4E2 (gradient: from-gray-300 to-gray-500)
Diamante: #B9F2FF (gradient: from-cyan-400 to-blue-500)
```

---

## 📱 Fluxo do Usuário

### 1. **Visitar um Parque**

```
Usuário abre detalhes do parque
         ↓
Clica em "Marcar como Visitado"
         ↓
Backend registra a visita
         ↓
UI atualiza para "✓ Já Visitei"
         ↓
Contador de visitas aumenta
         ↓
Verifica se desbloqueou badge
```

### 2. **Desbloquear Badge**

```
Usuário visita parques
         ↓
Atinge requisito de um badge
         ↓
Badge automaticamente desbloqueado
         ↓
Aparece na página de gamificação
         ↓
Progresso atualiza para próximo badge
```

### 3. **Ver Conquistas**

```
Usuário clica no ícone 🏆 no header
         ↓
Abre página /gamification
         ↓
Mostra estatísticas e badges
         ↓
Visualiza progresso e próximo objetivo
```

---

## 🔧 Configuração

### Backend

As rotas já estão configuradas em `backend/routes/users.js`. Nenhuma configuração adicional necessária.

### Frontend

Certifique-se de ter a variável de ambiente:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📊 Dados de Exemplo

### Usuário com 7 parques visitados:

```json
{
  "_id": "6919eed48e1db9c16d4f7341",
  "userId": "user_1763307220344_fg1oc3nmc",
  "visited": [
    {
      "playgroundId": "osm_123",
      "visitedAt": "2025-11-16T10:30:00Z"
    },
    {
      "playgroundId": "osm_456",
      "visitedAt": "2025-11-16T14:20:00Z"
    }
    // ... mais 5 parques
  ],
  "favorites": [ ... ],
  "visitedCount": 7
}
```

### Resposta de Stats:

```json
{
  "visitedCount": 7,
  "favoritesCount": 3,
  "lastSync": "2025-11-16T15:36:54.546Z"
}
```

### Progresso Calculado:

```json
{
  "visitedCount": 7,
  "unlockedBadges": ["explorer_5"],
  "nextBadge": {
    "id": "explorer_10",
    "name": "Aventureiro",
    "requirement": 10,
    "tier": "silver"
  },
  "progress": 40
}
```

---

## 🎯 Motivação do Sistema

### Objetivos:

1. **Engajamento**: Incentivar usuários a explorarem mais parques
2. **Retenção**: Criar objetivo de longo prazo (desbloquear todos badges)
3. **Comunidade**: Criar senso de conquista compartilhada
4. **Dados**: Coletar informações sobre quais parques são mais visitados

### Mecânicas de Gamificação:

- ✅ **Achievements** (Conquistas/Badges)
- ✅ **Progress Tracking** (Barra de progresso)
- ✅ **Tiers/Levels** (Bronze → Diamante)
- ✅ **Visual Feedback** (Ícones, cores, animações)
- ✅ **Goal Setting** (Próximo objetivo claro)

---

## 🔮 Futuras Melhorias

### Curto Prazo:

- [ ] Notificação quando desbloqueia badge
- [ ] Animação de badge desbloqueado
- [ ] Badge de "Primeira visita"
- [ ] Badge de "5 visitas em um dia"

### Médio Prazo:

- [ ] Leaderboard (ranking de usuários)
- [ ] Badges por região (visitou todos de Lisboa)
- [ ] Badges por tipo de parque
- [ ] Sistema de pontos (XP)
- [ ] Compartilhar conquistas nas redes sociais

### Longo Prazo:

- [ ] Badges sazonais/eventos
- [ ] Desafios semanais/mensais
- [ ] Conquistas colaborativas (comunidade)
- [ ] NFTs das conquistas (Web3)
- [ ] Recompensas físicas para badges raros

---

## 🧪 Testes

### Script de Teste Manual

```bash
# Marcar parques como visitados
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/users/user_123/visited \
    -H "Content-Type: application/json" \
    -d "{\"playgroundId\": \"park_$i\"}"
done

# Verificar stats
curl http://localhost:5000/api/users/user_123/stats
```

### Testar no Frontend

1. Abra um parque no mapa
2. Clique em "Marcar como Visitado"
3. Vá para `/gamification`
4. Verifique se contagem aumentou
5. Visite 5 parques e veja o badge "Explorador Iniciante" desbloquear

---

## 📝 Notas Importantes

1. **Duplicatas**: Backend previne marcar o mesmo parque duas vezes
2. **Offline**: Sistema funciona apenas online (requer conexão ao backend)
3. **Sync**: Não há sync automático entre dispositivos (vinculado ao userId)
4. **Performance**: Query de stats é rápida (apenas count de arrays)

---

## 🎉 Resultado Final

Sistema completo de gamificação implementado com:

- ✅ 5 badges (Bronze → Diamante)
- ✅ Tracking de visitas
- ✅ Página de conquistas
- ✅ Botão "Já visitei" nos parques
- ✅ Ícone no header
- ✅ Cálculo de progresso
- ✅ API backend completa
- ✅ UI/UX profissional

**Pronto para uso! 🚀**
