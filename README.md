# 🌮 Nachos Marketplace — Ticket System

A professional Discord.js v14 ticket system for **Nachos Marketplace**, featuring a pixel-art taco theme with golden yellow branding, multi-level category menus, and full ticket lifecycle management.

---

## 📁 Project Structure

```
nachos-tickets/
├── index.js                          # Bot entry point
├── package.json
├── .env.example                      # Copy to .env and fill in values
├── data/                             # Temp transcript storage
└── src/
    ├── config.js                     # All constants & theme colors
    ├── commands/
    │   └── panel.js                  # /panel — sends the ticket panel
    ├── events/
    │   ├── ready.js                  # Bot ready + auto-deploy commands
    │   └── interactionCreate.js      # All interaction routing
    ├── handlers/
    │   ├── commandHandler.js         # Command loader
    │   ├── eventHandler.js           # Event loader
    │   └── deployCommands.js         # Standalone deploy script
    └── utils/
        ├── panelBuilder.js           # Embed + menu builders
        └── ticketUtils.js            # Ticket CRUD + transcript logic
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
TOKEN=your_bot_token
CLIENT_ID=your_bot_client_id
GUILD_ID=your_guild_id
TICKET_CATEGORY_ID=1510971026232709160
STAFF_ROLE_ID=1497496326517031040
STAFF_USER_ID=1421835488808931441
LOGS_CHANNEL_ID=your_logs_channel_id
```

### 3. Deploy slash commands

Commands deploy automatically on bot startup. Or run manually:

```bash
npm run deploy
```

### 4. Start the bot

```bash
npm start
```

---

## 🤖 Bot Permissions Required

The bot needs these permissions in your server:

| Permission | Why |
|---|---|
| `Manage Channels` | Create & delete ticket channels |
| `Manage Messages` | Delete the ping message |
| `Send Messages` | Send embeds in tickets |
| `Read Message History` | Generate transcripts |
| `View Channel` | Access channels |
| `Attach Files` | Send transcript .txt files |
| `Mention Everyone` | Ping staff role |

---

## 🎟️ How It Works

### Ticket Panel
1. Staff runs `/panel` in any channel
2. A branded embed appears with a category dropdown

### User Flow
1. User selects a **main category** (Discord / Roblox / Streaming)
2. A **sub-menu** appears with specific products (ephemeral)
3. User picks a product → ticket channel is created instantly

### Ticket Lifecycle
- ✅ **Channel created** in category `1510971026232709160`
- 🔔 Staff role + user pinged, ping auto-deleted after 5 seconds
- 🎫 Ticket embed sent with product info and 3 control buttons
- 🙋 **Claim** — Staff claims the ticket (one claimer only)
- 🔒 **Close** — Transcript generated → sent to logs → channel deleted
- 🗑️ **Delete** — Staff-only instant deletion (no transcript)

---

## 🎨 Theme

Based on the **Nachos Marketplace** brand image:

| Color | Hex | Usage |
|---|---|---|
| Golden Yellow | `#F5A623` | Primary embeds, brand color |
| Deep Brown | `#2C1A0E` | Secondary / transcript embeds |
| Discord Blurple | `#5865F2` | Discord products sub-menu |
| Success Green | `#57C96C` | Claimed confirmation |
| Danger Red | `#E74C3C` | Streaming sub-menu / delete button |

---

## 📋 Ticket Channel Naming

| Product | Channel Format |
|---|---|
| Nitro | `nitro-username` |
| Server Boosts | `boosts-username` |
| Promo Links | `promolinks-username` |
| Blox Fruits | `bloxfruits-username` |
| Murder Mystery 2 | `mm2-username` |
| Adopt Me | `adoptme-username` |
| Netflix | `netflix-username` |
| Crunchyroll | `crunchyroll-username` |
| Spotify | `spotify-username` |
| Disney+ | `disney-username` |

---

## 🔒 Permissions Model

Each ticket channel grants:
- **@everyone** — cannot see channel
- **Ticket opener** — view, send, read history, attach files
- **Staff role** — view, send, read history, manage messages, attach files
- **Bot** — view, send, read history, manage channels, manage messages
