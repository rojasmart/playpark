# Sistema de Favoritos com MongoDB

## 📋 Visão Geral

O sistema de favoritos foi implementado com uma **estratégia híbrida**:

- ✅ **LocalStorage**: Armazenamento local rápido e acesso offline
- ✅ **MongoDB**: Persistência no servidor e sincronização entre dispositivos
- ✅ **Sincronização automática**: Favoritos são salvos localmente e sincronizados com o servidor em segundo plano

## 🏗️ Arquitetura

### Backend (MongoDB)

#### Modelo `User` (`backend/models/User.js`)

```javascript
{
  userId: String,           // ID único do usuário
  email: String,            // Email (opcional)
  favorites: [              // Array de favoritos
    {
      playgroundId: String,
      playgroundData: {...}, // Dados do parque
      addedAt: Date,
      notes: String
    }
  ],
  preferences: {...},       // Preferências do usuário
  lastSync: Date
}
```

#### Rotas API (`backend/routes/users.js`)

| Método | Endpoint                                           | Descrição                |
| ------ | -------------------------------------------------- | ------------------------ |
| GET    | `/api/users/:userId/favorites`                     | Obter todos os favoritos |
| POST   | `/api/users/:userId/favorites`                     | Adicionar favorito       |
| DELETE | `/api/users/:userId/favorites/:playgroundId`       | Remover favorito         |
| POST   | `/api/users/:userId/favorites/sync`                | Sincronizar favoritos    |
| GET    | `/api/users/:userId/favorites/check/:playgroundId` | Verificar se é favorito  |

### Frontend

#### Funções Utilitárias (`frontend/lib/favorites.ts`)

```typescript
// Gerenciamento local + servidor
getUserId(); // Obtém ou cria ID do usuário
getFavorites(); // Obter favoritos do localStorage
addFavorite(playground); // Adicionar + sync com servidor
removeFavorite(id); // Remover + sync com servidor
toggleFavorite(playground); // Alternar + sync com servidor
isFavorite(id); // Verificar se é favorito

// Sincronização
syncFavoritesWithServer(); // Enviar favoritos locais ao servidor
loadFavoritesFromServer(); // Carregar favoritos do servidor
```

## 🚀 Como Usar

### 1. Configurar Backend

```bash
cd backend
npm install

# Criar arquivo .env
echo "MONGO_URI=your_mongodb_connection_string" > .env
echo "PORT=5000" >> .env

# Iniciar servidor
npm start
```

### 2. Configurar Frontend

```bash
cd frontend
npm install

# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Iniciar aplicação
npm run dev
```

### 3. Uso no Código

#### Adicionar aos Favoritos

```typescript
import { addFavorite } from "@/lib/favorites";

await addFavorite({
  id: "playground_123",
  name: "Parque Central",
  lat: 38.7169,
  lon: -9.139,
  description: "Parque infantil",
  images: ["url1.jpg"],
  tags: { swing: "yes" },
});
```

#### Carregar Favoritos do Servidor

```typescript
import { loadFavoritesFromServer } from "@/lib/favorites";

// Ao iniciar a aplicação ou fazer login
const favorites = await loadFavoritesFromServer();
```

#### Sincronizar Favoritos

```typescript
import { syncFavoritesWithServer } from "@/lib/favorites";

// Sincronizar favoritos locais com o servidor
await syncFavoritesWithServer();
```

## 🔄 Fluxo de Sincronização

### Quando o usuário adiciona um favorito:

1. ✅ Salva imediatamente no localStorage (UX rápida)
2. ✅ Envia para o servidor em segundo plano
3. ✅ Se falhar, mantém no localStorage até próxima sincronização

### Quando o usuário acessa de outro dispositivo:

1. ✅ Chama `loadFavoritesFromServer()` ao iniciar
2. ✅ Carrega favoritos do MongoDB
3. ✅ Atualiza localStorage local
4. ✅ Renderiza na interface

### Sincronização periódica (opcional):

```typescript
// No componente principal ou layout
useEffect(() => {
  // Sincronizar a cada 5 minutos
  const interval = setInterval(() => {
    syncFavoritesWithServer();
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

## 🎯 Vantagens da Abordagem Híbrida

| Aspecto           | LocalStorage       | MongoDB               |
| ----------------- | ------------------ | --------------------- |
| **Velocidade**    | ⚡ Instantâneo     | 🐌 Requer rede        |
| **Offline**       | ✅ Funciona        | ❌ Requer conexão     |
| **Persistência**  | ⚠️ Por dispositivo | ✅ Global             |
| **Sincronização** | ❌ Não sincroniza  | ✅ Entre dispositivos |
| **Backup**        | ❌ Pode perder     | ✅ Seguro             |

## 📱 Integração Mobile

Para o app mobile React Native, as mesmas funções podem ser adaptadas:

```typescript
// Usar AsyncStorage em vez de localStorage
import AsyncStorage from "@react-native-async-storage/async-storage";

// Adaptar getUserId, getFavorites, etc.
```

## 🔐 Autenticação (Futuro)

Atualmente usa um `userId` gerado localmente. Para adicionar autenticação:

1. Implementar login (Firebase, Auth0, JWT, etc.)
2. Substituir `getUserId()` pelo ID do usuário autenticado
3. Adicionar middleware de autenticação nas rotas
4. Migrar favoritos do userId local para o userId autenticado

## 📊 Monitoramento

```javascript
// Verificar quantos favoritos estão sincronizados
const user = await User.findOne({ userId });
console.log(`Total favoritos: ${user.favorites.length}`);
console.log(`Última sincronização: ${user.lastSync}`);
```

## 🐛 Debugging

```javascript
// Forçar sincronização manual
await syncFavoritesWithServer();

// Carregar do servidor e substituir local
const serverFavorites = await loadFavoritesFromServer();
console.log("Favoritos do servidor:", serverFavorites);

// Verificar ID do usuário
import { getUserId } from "@/lib/favorites";
console.log("User ID:", getUserId());
```

## 📝 Notas Importantes

1. **User ID**: É gerado automaticamente no primeiro acesso e salvo no localStorage
2. **Sincronização**: Acontece automaticamente em segundo plano
3. **Falhas de rede**: O sistema continua funcionando offline com localStorage
4. **Dados duplicados**: O backend previne duplicatas usando `playgroundId`
5. **Performance**: Dados do parque são armazenados no documento do usuário (desnormalizado) para acesso rápido

## 🔧 Manutenção

### Limpar favoritos de um usuário

```javascript
await User.updateOne({ userId: "user_123" }, { $set: { favorites: [] } });
```

### Migrar favoritos entre usuários

```javascript
const oldUser = await User.findOne({ userId: "old_id" });
const newUser = await User.findOne({ userId: "new_id" });

newUser.favorites = [...newUser.favorites, ...oldUser.favorites];
await newUser.save();
```
