# Admin Dashboard

React admin dashboard for managing **Language** and **Landing Page** data.

## Project Structure

```
dashboard-app/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── index.js          # All API calls (centralized)
│   ├── components/
│   │   ├── Badge.jsx / .css
│   │   ├── CloneLanguageModal.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── DataCard.jsx / .css
│   │   ├── EmptyState.jsx / .css
│   │   ├── Modal.module.css  # Shared modal styles
│   │   ├── Navbar.jsx / .css
│   │   ├── SearchBar.jsx / .css
│   │   ├── SectionPanel.jsx / .css
│   │   ├── Spinner.jsx / .css
│   │   ├── Toast.jsx / .css
│   │   └── UpdateModal.jsx
│   ├── hooks/
│   │   └── useToast.js
│   ├── pages/
│   │   ├── LanguagePage.jsx
│   │   ├── LandingPage.jsx
│   │   └── Page.module.css   # Shared page styles
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── index.js
└── package.json
```

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```

The app runs at **http://localhost:3000**  
Your backend must be running at **http://localhost:5000**

## API Endpoints Used

### Language
| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch  | GET    | `/dashboard/get-language?l_id=` |
| Clone  | POST   | `/dashboard/clone-language` — body: `{ l_id, l_name }` |
| Update | POST   | `/dashboard/update-languages` — body: `{ l_id/lm_id/q_id, update: {} }` |
| Delete | DELETE | `/dashboard/delete-language` — body: `{ l_id/lm_id/q_id }` |

### Landing Page
| Action | Method | Endpoint |
|--------|--------|----------|
| Fetch  | GET    | `/dashboard/get-landing-page?lp_id=` |
| Clone  | POST   | `/dashboard/clone-landing-page` — body: `{ lp_id }` |
| Update | POST   | `/dashboard/update-landing-page` — body: `{ lp_id/lsq_id, update: {} }` |
| Delete | DELETE | `/dashboard/delete-landing-page` — body: `{ lp_id/lsq_id }` |

> **Note:** Update the delete endpoints in `src/api/index.js` if your backend uses different routes.

## Features

- 🔍 Fetch by ID — press Enter or click Fetch  
- 📋 Clone with custom name (Language) or direct clone (Landing Page)  
- ✏️ Edit any field via modal — only editable fields shown  
- 🗑️ Delete with confirmation dialog  
- 🟢 Toast notifications for all actions  
- 📐 Collapsible data cards with field preview  
- 📱 Responsive layout  
