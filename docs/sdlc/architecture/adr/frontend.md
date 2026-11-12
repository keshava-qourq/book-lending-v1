<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-11-12

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Next.js
- Vue

## Decision Outcome

Chosen option: React 19, because Approved stack. A handful of screens with instant search and borrow and return buttons that update counts on screen suit a client-rendered SPA. It is hosted as static files on S3 and CloudFront, and the session token is held in the client and sent as a Bearer header.

## Consequences

No server-side rendering, which a signed-in-only app does not need. Routing is a small added library.
<!-- sdlc:auto:end adr -->