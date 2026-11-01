# AI Chat Studio — Architecture Proposal

## Architecture style

A modular monolith: one React application and one FastAPI application, organized by feature and responsibility. The backend owns model credentials, provider calls, and persistence. The frontend calls only our backend API.

## Proposed repository layout

```text
grounded-ai-workbench/
├── README.md
├── .gitignore
├── .editorconfig
├── .env.example                 # names and safe placeholders only
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── App.tsx
│       │   └── app.css
│       ├── features/
│       │   ├── chat/
│       │   │   ├── api/chatApi.ts
│       │   │   ├── components/MessageList.tsx
│       │   │   ├── components/MessageComposer.tsx
│       │   │   ├── components/MessageBubble.tsx
│       │   │   ├── hooks/useChat.ts
│       │   │   ├── types.ts
│       │   │   └── ChatPage.tsx
│       │   └── conversations/
│       │       ├── api/conversationApi.ts
│       │       ├── components/ConversationSidebar.tsx
│       │       ├── hooks/useConversations.ts
│       │       └── types.ts
│       ├── shared/
│       │   ├── components/       # reusable buttons, dialogs, notices
│       │   ├── lib/apiClient.ts
│       │   └── styles/design-tokens.css
│       ├── main.tsx
│       └── test/
├── backend/
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── alembic/                  # versioned SQLite schema changes
│   ├── app/
│   │   ├── main.py
│   │   ├── api/v1/
│   │   │   ├── router.py
│   │   │   └── endpoints/
│   │   │       ├── health.py
│   │   │       ├── conversations.py
│   │   │       └── messages.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── logging.py
│   │   ├── db/
│   │   │   ├── session.py
│   │   │   └── models/
│   │   │       ├── conversation.py
│   │   │       └── message.py
│   │   ├── schemas/              # Pydantic request/response contracts
│   │   ├── repositories/         # database reads and writes
│   │   ├── services/             # chat and conversation use cases
│   │   └── providers/
│   │       ├── base.py            # provider contract
│   │       ├── registry.py        # allowed/configured providers
│   │       └── gemini.py
│   └── tests/
│       ├── unit/
│       └── api/
└── .github/workflows/            # lint, type-check, and test CI
```

## Request path

```text
React feature -> typed API client -> FastAPI endpoint -> Pydantic validation
              -> chat service -> provider contract -> Gemini SDK
              -> chat service -> repository/SQLite -> API response -> UI
```

## API shape (initial)

- `GET /api/v1/health`
- `GET /api/v1/conversations`
- `POST /api/v1/conversations`
- `PATCH /api/v1/conversations/{conversation_id}`
- `DELETE /api/v1/conversations/{conversation_id}`
- `GET /api/v1/conversations/{conversation_id}/messages`
- `POST /api/v1/conversations/{conversation_id}/messages`

Messages should carry stable IDs, roles, timestamps, provider/model metadata, and a request ID for support/debugging. Provider secrets and raw SDK objects never cross the API boundary.

## Key design decisions

- **TypeScript in React:** catches mismatched API fields and reduces UI state bugs.
- **Pydantic contracts:** validate inbound data and document the API in OpenAPI.
- **Provider interface:** vendor SDK calls stay in provider modules; business flow stays in the chat service.
- **Repository boundary:** persistence is separate from endpoint code, without turning every function into a layer.
- **SQLite + migrations:** durable local history with an upgrade path; no external database needed for the first release.
- **Free local mode:** a deterministic mock provider supports UI/API work when no API key or free quota is available.
- **Tests at seams:** provider contract/service tests, API tests with a temporary database and mock provider, and focused frontend component tests.
- **Streaming later:** first make request/response and persistence reliable; add SSE as an explicit follow-up milestone.

## Not in the first release

Authentication, cloud deployment, document retrieval, payment features, and multiple provider credentials. These add scope without improving the first complete local chat workflow.
