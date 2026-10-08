# QuickSends (quicksends.site)

> **Autonomous One-by-One Cold Email Engine**  
> Turn your prospect spreadsheets into bespoke, human-sounding outbound with zero robotic AI feel.

Official Website: [quicksends.site](https://quicksends.site)

---

## ⚡ Overview

**QuickSends** is an early-stage outbound engine built for founders and sales teams. Instead of blast-sending generic templates with superficial merge tags, QuickSends:
1. **Ingests your prospect spreadsheet** (`.csv` or `.xlsx`) containing lead details: Name, Email, Current Role, Bio Summary, and Past Career Experience.
2. **Analyzes each prospect individually** using an LLM to anchor onto real career transitions, specific engineering/business challenges, and relevant background hooks.
3. **Writes and dispatches simultaneously** one-by-one via SMTP with natural human pacing and zero "AI stench" clichés.

---

## 🛠️ Key Features

- **Spreadsheet Lead Ingestion**: Drag-and-drop CSV parser with sample pre-fill datasets.
- **Simultaneous 1-by-1 Craft & Send**: No bulk blasts that flag spam filters. Emails are synthesized and dispatched sequentially in real time.
- **The "Anti-AI" Personalization Engine**:
  - 🚫 **Banned Clichés**: No *"I hope this email finds you well"*, *"groundbreaking"*, or *"delving into synergies"*.
  - ✓ **Authentic Human Tone**: Casual lowercase subject lines, genuine career anchors, and low-friction conversational asks.
- **Interactive Live Simulator**: Built-in test sandbox with real-time terminal diagnostic logging and live previewing.
- **Private Beta Waitlist**: Interactive application flow for early testers.
- **Obsidian Kinetic Design**: Dark obsidian palette (`#090D16`), cyber-minimalism, technical glassmorphism (`#8B5CF6` & `#06B6D4` accents), and Geist/JetBrains Mono typography.

---

## 🚀 Getting Started

Clone the repository and open `index.html` in any modern web browser:

```bash
git clone https://github.com/theatendra/Quicksends-Website.git
cd Quicksends-Website
```

### Run Locally

Using Python:
```bash
python -m http.server 3000
```

Using Node (`serve`):
```bash
npx serve
```

Visit `http://localhost:3000` to interact with the live simulator.

---

## 📂 Project Structure

```
├── index.html       # Landing page structure & interactive simulator UI
├── style.css        # Obsidian Kinetic styling, glassmorphism & responsive design
├── app.js           # CSV parsing, sequential LLM craft & send loop, terminal logger
└── README.md        # Project documentation
```

---

## 📜 License

© 2026 QuickSends Technologies. All rights reserved.
