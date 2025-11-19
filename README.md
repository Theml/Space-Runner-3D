# Space Runner 3D - Estrutura do Projeto

## 📁 Estrutura de Arquivos

```
Lumina on the moon ligth/
├── index.html              # Página principal do jogo
├── index_backup.html       # Backup do código original
├── main.js                 # (não utilizado na versão modular)
├── css/
│   └── styles.css          # Estilos CSS do jogo
├── js/
│   ├── constants.js        # Constantes e configurações do jogo
│   ├── gameState.js        # Gerenciamento de estado do jogo
│   ├── player.js           # Lógica da espaçonave do jogador
│   ├── entities.js         # Factory para criar entidades (asteroides, coletáveis, etc)
│   ├── powerups.js         # Sistema de power-ups
│   ├── weapons.js          # Sistema de armas e projéteis
│   ├── ui.js               # Gerenciamento da interface do usuário
│   ├── input.js            # Gerenciamento de entrada do teclado
│   ├── gameLoop.js         # Loop principal e lógica de atualização
│   └── gameController.js   # Controlador principal que coordena todos os sistemas
└── assets/
    ├── background/
    ├── enemy/
    ├── enemy_animation/
    ├── weapon_animations/
    └── player+wisp+3d+model.glb
```

## 🎮 Módulos do Jogo

### constants.js

Define todas as constantes e configurações do jogo:

- `GameState`: Estados possíveis do jogo (MENU, PLAYING, PAUSED, GAME_OVER)
- `PowerUpType`: Tipos de power-ups disponíveis
- `GameConfig`: Configurações numéricas (velocidade, vidas, taxas de spawn, etc)

### gameState.js

Classe `GameStateManager` que gerencia:

- Estado atual do jogo
- Pontuação e vidas
- Arrays de objetos do jogo (asteroides, coletáveis, projéteis, etc)
- Métodos para reset, limpar objetos e gerenciar pontuação

### player.js

Classe `Player` que controla:

- Criação do modelo 3D da nave
- Movimento e controles
- Efeito de rastro (trail)
- Sistema de invulnerabilidade visual
- Colisões

### entities.js

Classe `EntityFactory` para criar:

- Asteroides com rotação
- Coletáveis (esferas verdes)
- Power-ups (torus coloridos)
- Projéteis
- Estrelas para efeito parallax
- Partículas de explosão

### powerups.js

Classe `PowerUpManager` que gerencia:

- Power-ups ativos e suas durações
- Aplicação de efeitos (escudo, tiro rápido, câmera lenta, tiro triplo)
- Atualização do display de power-ups na UI

### weapons.js

Classe `WeaponSystem` que controla:

- Cooldown de disparo
- Criação de projéteis (simples ou triplo)
- Integração com sistema de power-ups

### ui.js

Classe `UIManager` para gerenciar:

- Atualização de pontuação
- Display de vidas
- Telas (menu, pause, game over)
- High score

### input.js

Classe `InputManager` que lida com:

- Eventos de teclado (keydown/keyup)
- Comandos especiais (atirar, pausar, reiniciar)
- Integração com GameController

### gameLoop.js

Classe `GameLoop` com a lógica principal:

- Loop de atualização (registerBeforeRender)
- Atualização de todas as entidades
- Sistema de spawn
- Detecção de colisões
- Física de movimento

### gameController.js

Classe `GameController` que coordena:

- Inicialização do engine Babylon.js
- Setup da cena, câmera e iluminação
- Integração de todos os sistemas
- Controle do fluxo do jogo (start, pause, resume, game over)

## 🎯 Fluxo de Execução

1. **Inicialização** (DOMContentLoaded)

   - `GameController` é instanciado
   - Engine Babylon.js é configurado
   - Todos os managers são criados
   - Estrelas de fundo são geradas

2. **Menu** (Estado inicial)

   - Aguarda clique no botão "START GAME"
   - Exibe high score

3. **Jogo Ativo**

   - Player controla a nave com WASD/Arrows
   - Asteroides spawnam e se movem
   - Coletáveis e power-ups aparecem
   - Sistema de pontuação e vidas ativo
   - Loop de atualização constante

4. **Pause** (tecla P)

   - Jogo congela
   - Menu de pause exibido

5. **Game Over**
   - Quando vidas chegam a 0
   - Exibe pontuação final e high score
   - Opção de jogar novamente

## 🔧 Tecnologias Utilizadas

- **Babylon.js**: Engine 3D para renderização do jogo
- **JavaScript ES6+**: Classes, arrow functions, Map, destructuring
- **HTML5**: Canvas e estrutura semântica
- **CSS3**: Flexbox, transitions, animations

## 🎨 Características Técnicas

- **Arquitetura orientada a objetos**: Separação clara de responsabilidades
- **Sistema modular**: Fácil manutenção e extensão
- **Gerenciamento de estado centralizado**: GameStateManager
- **Factory pattern**: EntityFactory para criação de objetos
- **Observer pattern**: Sistema de eventos de teclado
- **Game loop otimizado**: Usando Babylon.js registerBeforeRender

## 🚀 Como Executar



## 📝 Controles

- **WASD / Setas**: Movimentar nave
- **Espaço**: Atirar
- **P**: Pausar/Despausar
- **R**: Reiniciar (na tela de Game Over)

## 🎮 Power-ups

- 🛡️ **Shield**: Protege contra uma colisão
- 🔥 **Rapid Fire**: Aumenta velocidade de disparo
- ⏱️ **Slow Motion**: Reduz velocidade do jogo
- 🔺 **Triple Shot**: Disparo triplo

## 📊 Sistema de Pontuação

- +1 ponto: Cada asteroide que passa
- +5 pontos: Destruir asteroide ou coletar power-up
- +10 pontos: Coletar orbs verde
