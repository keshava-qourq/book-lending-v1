<!-- sdlc:auto:start adr -->
# ADR-0004: Use AWS for Cloud

Status: Accepted  
Date: 2026-11-12

## Context and Problem Statement

Which Cloud technology does the project use? Decided in architecture v1.

## Considered Options

- AWS
- Azure
- GCP

## Decision Outcome

Chosen option: AWS, because Approved stack. RDS provides managed PostgreSQL, App Runner runs the API container simply, and S3 with CloudFront hosts the SPA on its own origin.

## Consequences

Two separate origins mean CORS configuration, which is handled by an explicit allowed origin.
<!-- sdlc:auto:end adr -->