# 🗺️ Project Routes & File Structure

This document outlines the standard frontend pages and backend API endpoints available within the campaign manager application.

---

## 💻 Frontend Pages

These are the public and authenticated pages accessible to users in the browser.

| Path | File Location | Description |
| :--- | :--- | :--- |
| `/` | `app/page.tsx` | **Home Page** • Landing page for the application. |
| `/books` | `app/books/page.tsx` | **Rulebooks & Lore** • Reference library for rulebooks, compendiums, and game rules. |
| `/character` | `app/character/page.tsx` | **Character Creator** • Tool for building and editing character sheets. |
| `/party/join` | `app/party/join/page.tsx` | **Join Party** • Page to join an existing game session via an invite code. |
| `/party/create` | `app/party/create/page.tsx` | **Create Party** • Interface to create a campaign and generate invite codes. |
| `/account/login` | `app/account/login/page.tsx` | **Login Page** • User authentication interface. |
| `/account/signup` | `app/account/signup/page.tsx` | **Sign Up Page** • User registration form. |

---

## ⚙️ Backend & API Routes

These endpoints handle data operations and authentication behind the scenes.

| Endpoint | File Location | Description |
| :--- | :--- | :--- |
| `/api/auth/[...all]` | `app/api/auth/[...all]/route.ts` | **Better Auth Handler** • Manages user sessions, OAuth, and authentication endpoints. |

---

## 📜 Developer Notes

* **File-System Routing:** This project uses the Next.js `app` router. Deleting any `page.tsx` file will remove its corresponding route from the application.
* **Dynamic Auth Route:** The `[...all]` catch-all route under `/api/auth` is managed by the **Better Auth** library. Do not modify its structure unless updating the authentication setup.
