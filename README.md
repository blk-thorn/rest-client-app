# REST Client

**Deploy:** https://restclient-rft.netlify.app/ru

This project is a light-weight version of [**Postman**](https://www.postman.com/) in one app for using (and building) APIs.  
It supports method selection, URL, headers.

Additionally, it includes:

- Authorization and authentication capabilities, ensuring access to the tool is restricted to authorized users.
- History section, which allows users to restore and re-execute previously sent requests.

## Features

- Supported HTTP methods: **GET, POST, PUT, DELETE**
- Full request body editor (JSON, form-data, raw, etc.)
- Headers editor
- Environment variables support
- Request history with instant restore & re-run
- Code generation (cURL, fetch, axios)
- Response viewer with syntax highlighting
- Full user authentication & authorization
- All data (history, variables) saved per user

## Technology Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **State Management**: Zustand + Zod validation
- **Styling**: Tailwind CSS
- **Auth & Data**: Firebase (Auth + Firestore)
- **Bundler**: Vite
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier + Husky

## Backend / API

- Firebase handles auth and persistent storage
- External API calls are securely proxied via Next.js API Routes (bypasses CORS)

## Application Structure

1. **Landing / Auth Page** — login & registration
2. **Main REST Client**
   - HTTP method selector
   - URL input
   - Tabs: Body / Headers / Auth / Query Params
   - Send button
   - Response section (status, time, size, body)
   - Code generation panel
3. **Environment Variables** — manage reusable values
4. **History** — list of past requests with one-click restore and re-execution

## Team

- **Alexandr** — Team Lead — [GitHub](https://github.com/Belifegor)
- **Anna** — Frontend Developer — [GitHub](https://github.com/ann-sm)
- **Victoria** — Frontend Developer — [GitHub](https://github.com/blk-thorn)
