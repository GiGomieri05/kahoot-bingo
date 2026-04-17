# 🎯 BINGO LIVE — Guia de Construção

## Visão Geral do Produto

**Nome sugerido:** BingoLive (ou "Mission Bingo" se quiser manter o tema espacial como default)

**O que é:** Um bingo interativo ao vivo para sala de aula, estilo Kahoot. O professor cria temas, inicia sessões, e os alunos jogam no celular em tempo real.

**Stack:** React + Vite + TypeScript + Firebase Realtime Database + Tailwind CSS + Vercel

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    FIREBASE RTDB                     │
│                                                     │
│  /themes/{themeId}                                  │
│    name: "Space English"                            │
│    items: [                                         │
│      { word: "Moon", clue: "Earth's satellite" },   │
│      { word: "Star", clue: "Shines at night" },     │
│      ...16-24 items                                 │
│    ]                                                │
│                                                     │
│  /sessions/{sessionCode}                            │
│    themeId: "abc123"                                │
│    status: "waiting" | "playing" | "finished"       │
│    currentClueIndex: 3                              │
│    calledItems: [0, 5, 3, ...]                      │
│    hostId: "professor-uid"                          │
│                                                     │
│  /sessions/{code}/players/{playerId}                │
│    name: "Maria"                                    │
│    board: [4, 12, 7, 0, ...] (16 índices)           │
│    marked: [4, 0] (índices marcados)                │
│    score: 150                                       │
│    bingo: false                                     │
│    joinedAt: timestamp                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Fluxo:

```
Professor                          Aluno
    │                                │
    ├─ Cria/escolhe tema             │
    ├─ Inicia sessão (gera código)   │
    ├─ Projeta tela + QR code        │
    │                                ├─ Escaneia QR / digita código
    │                                ├─ Digita nome
    │                                ├─ Recebe cartela aleatória
    │  (vê alunos entrando)          │
    │                                │
    ├─ Clica "Sortear!"              │
    │  → Firebase atualiza           │
    │    currentClueIndex            │
    │                                ├─ Vê a dica na tela
    │                                ├─ Marca na cartela se tem
    │                                │
    │  (repete até alguém...)        │
    │                                ├─ Completa linha → "BINGO!"
    │                                │
    ├─ Sistema valida                │
    ├─ Mostra ranking final          │
    └─ Encerra sessão                │
```

---

## Estrutura de Pastas

```
src/
├── main.tsx
├── App.tsx
├── firebase.ts              (config do Firebase)
├── pages/
│   ├── Home.tsx              (landing: Host ou Player?)
│   ├── host/
│   │   ├── ThemeManager.tsx   (criar/editar temas)
│   │   ├── Lobby.tsx          (sala de espera + QR code)
│   │   ├── GameControl.tsx    (controle do jogo ao vivo)
│   │   └── Results.tsx        (ranking final)
│   └── player/
│       ├── JoinSession.tsx    (digitar código + nome)
│       ├── WaitingRoom.tsx    (esperando começar)
│       ├── BingoBoard.tsx     (a cartela do jogo)
│       └── PlayerResults.tsx  (resultado individual)
├── components/
│   ├── BingoCard.tsx          (componente da cartela 4x4)
│   ├── ClueDisplay.tsx        (exibição da dica atual)
│   ├── PlayerList.tsx         (lista de jogadores)
│   ├── QRCode.tsx             (gerador de QR code)
│   ├── Timer.tsx              (countdown visual)
│   ├── Confetti.tsx           (animação de vitória)
│   └── ScoreBoard.tsx         (ranking ao vivo)
├── hooks/
│   ├── useSession.ts          (listener da sessão)
│   ├── useThemes.ts           (CRUD de temas)
│   └── useGameState.ts        (estado do jogo)
├── utils/
│   ├── generateBoard.ts       (gera cartela aleatória)
│   ├── validateBingo.ts       (valida se é bingo real)
│   └── generateCode.ts        (gera código de sessão)
└── types/
    └── index.ts               (TypeScript types)
```

---

## PROMPTS PARA CONSTRUÇÃO

Use esses prompts na ordem. Cada um constrói uma parte da aplicação.
Pode usar comigo (Claude) ou em outra sessão.

---

### PROMPT 1 — Setup do projeto + Firebase + Types

```
Crie o setup de um projeto React + Vite + TypeScript + Tailwind CSS para uma aplicação chamada "BingoLive".

1. Me dê os comandos para criar o projeto com Vite
2. Crie o arquivo `src/firebase.ts` com a configuração do Firebase Realtime Database (use placeholders para as env vars: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_DATABASE_URL, VITE_FIREBASE_PROJECT_ID)
3. Crie o arquivo `src/types/index.ts` com os seguintes tipos TypeScript:

- Theme: { id, name, description, items: ThemeItem[], createdAt }
- ThemeItem: { word: string, clue: string }
- Session: { id, code, themeId, status: 'waiting'|'playing'|'finished', currentClueIndex, calledItems: number[], hostId, createdAt }
- Player: { id, name, board: number[], marked: number[], score, bingo, joinedAt }

4. Crie `src/utils/generateCode.ts` — gera código de sessão de 6 caracteres alfanuméricos uppercase
5. Crie `src/utils/generateBoard.ts` — recebe um array de ThemeItems e retorna um array de 16 índices aleatórios (sem repetir) para a cartela 4x4
6. Crie `src/utils/validateBingo.ts` — recebe o board (16 índices) e marked (índices marcados) e verifica se há linha, coluna ou diagonal completa

Use apenas Firebase Realtime Database (não Firestore).
O tema visual é dark mode com cores vibrantes, estilo gaming/arcade.
```

---

### PROMPT 2 — Hooks do Firebase

```
Para o projeto BingoLive (React + TypeScript + Firebase RTDB), crie os seguintes hooks:

1. `src/hooks/useThemes.ts`:
   - getThemes(): listener que retorna todos os temas
   - createTheme(theme): cria um novo tema
   - deleteTheme(id): deleta um tema
   - Os temas ficam em /themes/{themeId} no RTDB

2. `src/hooks/useSession.ts`:
   - createSession(themeId): cria sessão com código único de 6 chars, status "waiting"
   - joinSession(code, playerName): adiciona player à sessão, gera board aleatório
   - useSessionListener(code): retorna estado da sessão em tempo real (onValue)
   - usePlayersListener(code): retorna lista de players em tempo real
   - updateSessionStatus(code, status): atualiza status
   - callNextItem(code, itemIndex): adiciona item ao array calledItems e atualiza currentClueIndex
   - markItem(code, playerId, itemIndex): adiciona ao array marked do player
   - declareBingo(code, playerId): marca bingo=true no player

3. `src/hooks/useGameState.ts`:
   - Hook que combina session + players listeners
   - Calcula automaticamente se algum player tem bingo válido
   - Retorna: session, players, currentClue, isGameOver, winner

Use ref/set/push/update/onValue do Firebase RTDB.
Trate erros e loading states.
Tipos importados de ../types
```

---

### PROMPT 3 — Página Home + Roteamento

```
Para o projeto BingoLive, crie:

1. `src/App.tsx` com React Router (react-router-dom v6):
   - / → Home
   - /host → fluxo do professor (ThemeManager → Lobby → GameControl → Results)
   - /play → fluxo do aluno (JoinSession → WaitingRoom → BingoBoard → PlayerResults)
   - /play/:code → atalho para entrar direto numa sessão (vindo do QR code)

2. `src/pages/Home.tsx`:
   - Tela de entrada bonita com o nome "BingoLive" grande, com gradiente animado
   - Dois botões grandes: "🎤 Host a Game" e "🎮 Join a Game"
   - Design: dark background (#0B0D1A), cards com borda sutil, fonte Nunito
   - Animação de entrada (fade in + scale)
   - No rodapé: "Made for the classroom 🏫"

Estilo visual inspirado em gaming/arcade: cores vibrantes (azul #1CB0F6, roxo #CE82FF, 
rosa #FF86C8, verde #58CC02, amarelo #FFC800), cantos arredondados, 
sombras com glow sutil, botões com box-shadow embaixo (efeito 3D como Duolingo).
Dark mode apenas. Fonte Nunito (Google Fonts).
```

---

### PROMPT 4 — Tela de Criação de Temas (Host)

```
Para o projeto BingoLive, crie a página `src/pages/host/ThemeManager.tsx`:

Essa é a tela onde o professor cria e gerencia temas para o bingo.

Funcionalidades:
1. Lista de temas existentes (cards com nome, quantidade de itens, botão deletar)
2. Botão "Criar novo tema" que abre um formulário:
   - Nome do tema (ex: "Space English", "Animals", "Food")
   - Descrição curta opcional
   - Lista de itens do tema (mínimo 16, máximo 30):
     - Cada item tem: WORD (a palavra que aparece na cartela) e CLUE (a dica que o professor sorteia)
     - Exemplo: Word="Moon", Clue="Earth's natural satellite"
   - Botão para adicionar mais itens
   - Botão para remover itens
   - Botão "Salvar tema"
3. Ao selecionar um tema existente: botão "Iniciar sessão com esse tema" → navega para o Lobby
4. Inclua 3 temas pré-criados já salvos como default na primeira vez:
   - "Space English" (16 itens: Moon, Star, Sun, Earth, Planet, Rocket, Astronaut, Space, Orbit, Comet, Galaxy, Gravity, Crater, Telescope, Satellite, Atmosphere)
   - "Colors & Animals" (16 itens com animais + cores em inglês)
   - "Food & Drinks" (16 itens com comidas e bebidas em inglês)

Use o hook useThemes.
Design: cards com hover effect, formulário clean, 
badges mostrando quantidade de itens por tema.
Cores vibrantes no dark mode. Botão de voltar para Home.
```

---

### PROMPT 5 — Lobby do Host (QR Code + Sala de Espera)

```
Para o projeto BingoLive, crie a página `src/pages/host/Lobby.tsx`:

Essa é a tela que o professor projeta na sala enquanto os alunos entram.

1. Ao montar: cria uma nova sessão no Firebase com o tema selecionado
2. Exibe:
   - Código da sessão BEM GRANDE (tipo 120px, com espaçamento entre letras)
   - QR Code que aponta para /play/{código} (use a lib qrcode.react)
   - Texto: "Scan the QR code or go to [URL] and enter code: [CODE]"
   - Nome do tema selecionado
   - Lista de jogadores que vão entrando (em tempo real, com animação de entrada)
   - Contador: "X players connected"
3. Botão "Start Game!" (só aparece quando tem pelo menos 2 jogadores)
4. Ao clicar Start: atualiza status para "playing" → navega para GameControl

Design para projeção:
- Tudo GRANDE e legível de longe
- QR code centralizado, branco com fundo escuro
- Players aparecem como chips/badges coloridos ao redor do QR code
- Animação quando novo player entra (tipo pop-in com confetti pequeno)
- Fundo com partículas sutis animadas (estrelas ou formas geométricas)
- Música? Não, mas um feedback sonoro sutil quando player entra (Web Audio API, 
  um "ding" ascendente)
```

---

### PROMPT 6 — Tela do Aluno: Join + Waiting

```
Para o projeto BingoLive, crie:

1. `src/pages/player/JoinSession.tsx`:
   - Se veio pela rota /play/:code, já preenche o código
   - Se veio por /play, mostra campo para digitar código de 6 caracteres (input grande, auto-uppercase)
   - Campo para digitar o nome (nickname)
   - Botão "Join!" 
   - Ao clicar: valida se sessão existe e está em "waiting", 
     joga joinSession(code, name), navega para WaitingRoom
   - Se sessão não existe: erro animado no input
   - Design mobile-first (maioria vai acessar pelo celular)
   - Inputs grandes, touch-friendly, teclado otimizado

2. `src/pages/player/WaitingRoom.tsx`:
   - Mostra: "You're in! Waiting for the host to start..."
   - Nome do tema
   - Lista de outros jogadores conectados (tempo real)
   - Animação de loading divertida (foguete subindo, ou dots pulsando)
   - Quando session.status mudar para "playing": navega automaticamente para BingoBoard

Design mobile-first, dark mode, botões grandes, feedback visual claro.
```

---

### PROMPT 7 — Cartela de Bingo (a tela principal do aluno)

```
Para o projeto BingoLive, crie `src/pages/player/BingoBoard.tsx`:

Essa é A tela mais importante do app. É onde o aluno joga.

1. Layout: grid 4x4 com as palavras do tema (geradas aleatoriamente para cada aluno)
2. No topo: a DICA ATUAL que o professor sorteou (atualiza em tempo real via Firebase)
   - A dica aparece com animação de entrada (slide down + fade)
   - Timer visual opcional (countdown de 15 segundos, configurável pelo host)
3. Cada célula da cartela:
   - Mostra a WORD
   - Ao tocar: marca a célula (muda de cor, fica com check)
   - Se a palavra NÃO corresponde à dica atual: 
     permite marcar mesmo assim (no bingo real você marca por conta), 
     MAS se marcar errado e declarar bingo, perde pontos
   - Célula marcada: fundo verde com check animado
   - Animação de tap: scale pulse
4. Detecção de BINGO:
   - Quando o aluno completa linha/coluna/diagonal, 
     aparece um botão grande pulsante: "🎉 BINGO!"
   - Ao clicar: envia para Firebase, sistema valida
   - Se válido: tela de vitória com confetti
   - Se inválido (marcou célula errada): feedback de erro, 
     remove as marcações inválidas
5. Score em tempo real no topo (pontos por marcação correta)
6. Número de itens já sorteados / total

Design:
- Grid responsiva que funciona bem em celular (células quadradas, ~70px)
- Cores: célula normal = card escuro, marcada = verde vibrante
- Dica atual = destaque grande no topo com cor diferente (azul ou roxo)
- Transições suaves em tudo
- Haptic feedback simulado (animação de shake no erro)
- Fonte legível em tamanho pequeno (as palavras na cartela)
```

---

### PROMPT 8 — Tela de Controle do Host (Game Control)

```
Para o projeto BingoLive, crie `src/pages/host/GameControl.tsx`:

Essa é a tela que o professor projeta durante o jogo.

Layout dividido em 3 áreas:

1. ÁREA PRINCIPAL — Dica atual:
   - Mostra a CLUE da vez, BEM GRANDE (para projeção)
   - Abaixo: a WORD correspondente (revelada após X segundos, ou quando o host clica "Reveal")
   - Botão grande "Next Clue 🎲" para sortear a próxima
   - Indicador: "Clue 5 of 16"
   - Animação de entrada da dica (tipo flip card ou slide)

2. LATERAL DIREITA — Ranking ao vivo:
   - Lista de jogadores ordenada por score
   - Mostra: posição, nome, score, se já marcou a atual
   - Atualiza em tempo real
   - Top 3 com destaque visual (ouro, prata, bronze)
   - Animação quando posições mudam

3. RODAPÉ — Controles:
   - Botão "Next Clue"
   - Botão "Reveal Answer" 
   - Botão "Pause"
   - Botão "End Game" → vai para Results
   - Indicador de quantos players estão conectados

4. ALERTA DE BINGO:
   - Quando um aluno declara bingo, aparece um overlay grande:
     "🎉 [NOME] declared BINGO!"
   - Botão "Validate" → sistema checa automaticamente
   - Se válido: confetti + som + "BINGO CONFIRMED! 🏆"
   - Se inválido: "Not yet! Keep playing 🎲"

Design para projeção:
- Tudo grande e legível
- Dark background, dica em destaque com glow
- Ranking com barras de progresso visuais
- Transições cinematográficas entre dicas
```

---

### PROMPT 9 — Telas de Resultado

```
Para o projeto BingoLive, crie:

1. `src/pages/host/Results.tsx` (projetada na sala):
   - Pódio visual: 1º, 2º, 3º lugar com tamanhos diferentes
   - Nome, score, e emoji de medalha (🥇🥈🥉)
   - Ranking completo abaixo do pódio
   - Estatísticas: total de dicas sorteadas, tempo de jogo, 
     precisão média da turma
   - Animação de entrada cinematográfica (reveal do 3º → 2º → 1º)
   - Confetti animado
   - Botão "Play Again" (mesma turma, novo jogo)
   - Botão "New Session" (volta pro ThemeManager)
   - Botão "Home"

2. `src/pages/player/PlayerResults.tsx` (no celular do aluno):
   - Mostra a posição individual
   - Score final
   - Cartela final com marcações certas (verde) e erradas (vermelho)
   - Mensagem personalizada baseada na posição:
     - 1º: "🏆 Champion! You won!"
     - 2º-3º: "🥈 Amazing! Almost there!"
     - Top 50%: "⭐ Great job!"
     - Bottom 50%: "🚀 Keep practicing!"
   - Botão "Play Again" (espera host iniciar)

Design celebrativo, confetti, cores vibrantes, 
animações de entrada escalonadas.
```

---

### PROMPT 10 — Componentes auxiliares

```
Para o projeto BingoLive, crie os seguintes componentes:

1. `src/components/QRCode.tsx`: 
   - Usa qrcode.react
   - Props: url, size
   - Wrapper com borda arredondada e padding branco

2. `src/components/Timer.tsx`:
   - Countdown visual circular (SVG)
   - Props: seconds, onComplete, isRunning
   - Muda de cor quando falta pouco (verde → amarelo → vermelho)
   - Animação de pulso nos últimos 3 segundos

3. `src/components/Confetti.tsx`:
   - Confetti animado em canvas
   - Props: isActive, duration
   - Partículas coloridas caindo

4. `src/components/ScoreBoard.tsx`:
   - Lista de jogadores com score
   - Props: players[], highlightId?
   - Animação de reorder quando ranking muda

5. `src/components/ClueDisplay.tsx`:
   - Exibe a dica atual com animação
   - Props: clue, word, isRevealed
   - Flip animation quando revela a palavra

6. `src/components/SoundEffects.ts`:
   - Web Audio API (sem arquivos de áudio)
   - Funções: playJoin(), playCorrect(), playWrong(), playBingo(), playReveal()
   - Sons sintetizados (igual os do Space Mission)
```

---

## REGRAS DO FIREBASE RTDB

```json
{
  "rules": {
    "themes": {
      ".read": true,
      ".write": true
    },
    "sessions": {
      "$sessionCode": {
        ".read": true,
        ".write": true,
        "players": {
          "$playerId": {
            ".read": true,
            ".write": true
          }
        }
      }
    }
  }
}
```

> Nota: essas regras são abertas para desenvolvimento. 
> Para produção, restrinja com auth ou validação.

---

## VARIÁVEIS DE AMBIENTE (.env)

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://xxx-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

---

## CONFIGURAÇÃO DO FIREBASE (passo a passo)

1. Acesse https://console.firebase.google.com
2. Crie um novo projeto (nome: "bingolive" ou similar)
3. Desative Google Analytics (não precisa)
4. Vá em "Realtime Database" → "Create Database"
5. Escolha a região mais próxima (us-central1 ou southamerica-east1)
6. Comece em "test mode" (regras abertas por 30 dias)
7. Vá em Project Settings → General → "Add app" → Web
8. Copie as credenciais para o .env
9. Pronto!

---

## ESTILIZAÇÃO — Diretrizes

### Paleta de cores:
- Background: #0B0D1A (quase preto azulado)
- Cards: #151933 (dark navy)
- Borders: #2A2F52
- Azul primário: #1CB0F6
- Verde (acerto): #58CC02
- Vermelho (erro): #FF4B4B
- Amarelo (destaque): #FFC800
- Rosa: #FF86C8
- Roxo: #CE82FF
- Laranja: #FF9600
- Texto principal: #E8E6F0
- Texto secundário: #8A89A0

### Componentes visuais:
- Botões com efeito 3D (box-shadow embaixo, 4-5px)
- Border-radius generoso (12-16px)
- Hover com translateY(-2px) + shadow increase
- Active com translateY(2px) + shadow decrease
- Cards com borda sutil + shadow com glow
- Inputs grandes e touch-friendly (min 48px height)

### Animações:
- Entrada de telas: scale(0.93) + translateY(12px) → normal
- Cells da cartela: pulse no tap
- Dicas: flip ou slide from top
- Ranking: smooth reorder com transition
- Bingo: explosion de confetti + shake + glow

### Tipografia:
- Font family: Nunito (Google Fonts, weights 400-900)
- Títulos: 900 weight
- Corpo: 600-700 weight
- Dicas projetadas: 800 weight, 36-48px

### Mobile-first:
- Cartela responsiva (grid com fr units)
- Touch targets mínimo 44px
- Sem hover effects em mobile (use active states)
- QR code legível em projeção (mínimo 200x200px)

---

## ORDEM DE CONSTRUÇÃO RECOMENDADA

1. Setup projeto + Firebase + Types (Prompt 1)
2. Hooks do Firebase (Prompt 2)
3. Home + Roteamento (Prompt 3)
4. Theme Manager (Prompt 4) — teste criando temas
5. Lobby do Host (Prompt 5) — teste gerando QR codes
6. Join + Waiting do aluno (Prompt 6) — teste o fluxo de entrada
7. **BingoBoard** (Prompt 7) — o coração do app
8. GameControl do Host (Prompt 8) — controle do jogo
9. Results (Prompt 9) — telas finais
10. Componentes auxiliares (Prompt 10) — polish

Teste cada prompt isoladamente antes de ir pro próximo.
Deploy na Vercel a cada etapa pra testar em celular real.

---

## MELHORIAS FUTURAS (não fazer agora)

- [ ] Auth do professor (login com Google)
- [ ] Histórico de sessões jogadas
- [ ] Modo "Speed Bingo" (timer automático entre dicas)
- [ ] Geração automática de temas com IA (API do Claude)
- [ ] Sons e música de fundo
- [ ] PWA (instalar no celular)
- [ ] Integração com RDB Futura como ferramenta para escolas
