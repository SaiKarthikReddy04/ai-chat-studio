# AI Chat Studio — Product Brief

## Product direction

Build a polished, responsive AI chat workspace where a user can hold separate conversations, choose an available model, and trust that each request is handled safely and predictably.

The product keeps the familiar React + FastAPI architecture while making the experience and engineering quality portfolio-ready.

## Product qualities

- **Premium interaction design:** calm visual hierarchy, deliberate spacing and typography, responsive layout, accessible controls, useful empty/loading/error states, and keyboard-friendly chat composition.
- **Conversation workflow:** create, rename, reopen, and delete conversations; preserve messages across reloads.
- **Model transparency:** show the selected provider/model and distinguish configured models from unavailable ones.
- **Safe server-side credentials:** provider keys live only in backend environment configuration and are never sent to the browser or committed.
- **Reliable requests:** validate input, apply timeouts, return consistent errors, and show actionable UI feedback.
- **Provider independence:** use one backend provider contract so UI/API behavior does not depend on vendor-specific SDK details.
- **Maintainability:** typed API contracts, small feature-oriented modules, focused tests, clear configuration, and reproducible setup documentation.

## First release scope

1. One user, no authentication.
2. Responsive chat workspace with conversation sidebar and polished message composer.
3. Persistent local conversation history.
4. One working provider (Gemini free tier); other providers can be added behind the provider contract later.
5. Markdown messages, copy, retry, loading, and error states.
6. Server-side provider configuration, request validation, timeouts, and structured logging.
7. Unit/API tests and a clear README with setup and troubleshooting steps.

## Deliberate later additions

- Streaming responses using Server-Sent Events.
- Additional model providers.
- Conversation search, export, and user accounts.
- Deployment and production monitoring.

## Success criteria

- A reviewer can run the app locally from documented steps and exchange a real message with a configured provider.
- Conversations survive browser refresh and can be managed from the UI.
- Provider secrets never enter frontend code, API responses, logs, or Git.
- Unsupported models, missing configuration, timeouts, and provider failures produce understandable errors.
- The code is organized around product features and backend responsibilities without introducing unnecessary service layers.

## Constraints

- Build an original implementation; do not copy source or visual assets from the reference ZIP.
- Keep the first version free to run locally; Gemini is the initial provider and its free-tier quota/eligibility applies.
- Treat the downloaded project only as a reference for the broad React + FastAPI idea.
