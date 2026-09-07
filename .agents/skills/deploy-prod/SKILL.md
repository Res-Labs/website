---
name: deploy-prod
description: Deploy the Res Labs static site to Vercel production with the project-scoped ObjectOS credentials.
---

# Deploy Res Labs to production

Use this skill only from `/Users/joon/projects/twoj/res-labs/website`.

Production deployment requires both of these conditions:

1. The current source has passed the local and preview checks in `README.md`.
2. The user has explicitly approved the production deployment.

Do not deploy production while either condition is missing. This skill does not create tokens, change DNS, or deploy the separate ObjectOS Research Chemical environment.
This repository is connected to Vercel's Git integration. A push to `main` can trigger a production deployment even when this helper is not run. Treat every source push to `main` as a production side effect and require explicit user approval before pushing release changes.

## Load the credentials

The Vercel credentials live in the `ObjectOS` secrets namespace. The token is project-scoped, so load it with the exact project name and key names below. The `source` and `load` commands must run in the same shell:

```sh
GATE=/Users/joon/.agents/skills/secrets/scripts/secret_output_gate.sh
(
  source "$GATE" && \
    secret_output_gate -p ObjectOS load VERCEL_LANDING_PAGE_TOKEN VERCEL_LANDING_PAGE_PROJECT_ID
)
```

For the deployment itself, keep the load and all Vercel commands in one subshell:

```sh
GATE=/Users/joon/.agents/skills/secrets/scripts/secret_output_gate.sh
(
  source "$GATE" && \
    secret_output_gate -p ObjectOS load VERCEL_LANDING_PAGE_TOKEN VERCEL_LANDING_PAGE_PROJECT_ID && \
    ...
)
```

Never use `VERCEL_TOKEN`, the legacy secrets script, inline secret values, or a checked-in `.env` file. Never print the token or project ID. Do not run `vercel login` or `vercel whoami` as a credential test. Those commands require user or team scope and can report `User not found` for a valid project-scoped token.

## Confirm project access

Before deploying, test the project resource, not the user resource:

```sh
curl -fsS -o /dev/null \
  -w 'project_status=%{http_code}\n' \
  "https://api.vercel.com/v9/projects/$VERCEL_LANDING_PAGE_PROJECT_ID" \
  -H "Authorization: Bearer $VERCEL_LANDING_PAGE_TOKEN"
```

Continue only when the status is `200`. A `401`, `403`, or any other status is a credential or permission failure. Stop and report the gate or API error without exposing values.

## Deploy

The Vercel CLI may try to discover user or team scope during `link`, which is incompatible with this project-scoped token. Use the repository helper instead. It uploads only the website files listed in the helper and waits for Vercel to report `READY`.

```sh
GATE=/Users/joon/.agents/skills/secrets/scripts/secret_output_gate.sh
(
  source "$GATE" && \
    secret_output_gate -p ObjectOS load VERCEL_LANDING_PAGE_TOKEN VERCEL_LANDING_PAGE_PROJECT_ID && \
    curl -fsS -o /dev/null \
      -w 'project_status=%{http_code}\n' \
      "https://api.vercel.com/v9/projects/$VERCEL_LANDING_PAGE_PROJECT_ID" \
      -H "Authorization: Bearer $VERCEL_LANDING_PAGE_TOKEN" && \
    node .agents/skills/deploy-prod/scripts/deploy-vercel-static.mjs
)
```

The helper prints file names, deployment ID, deployment URL, and readiness state only. It does not print credentials.

## Verify production

After the helper reports `deployment_state=READY`, check the public production URL:

```sh
curl -fsS -o /dev/null https://reslabs.ai/
curl -fsS https://reslabs.ai/robots.txt
curl -fsS https://reslabs.ai/sitemap.xml
curl -fsS -o /dev/null https://reslabs.ai/favicon.svg
curl -fsS -o /dev/null https://reslabs.ai/assets/og-image.png
```

Inspect the page in a browser and confirm the title, description, canonical URL, heading, CTA, favicon, and visible layout match the approved preview. Do not claim production success until the deployment is `READY` and these checks pass.

## Troubleshooting

- `code=load_requires_source`: source the gate and call `secret_output_gate` in the same shell.
- `User not found` from `/v2/user`, `vercel whoami`, or `vercel link`: do not rotate the token. Test `/v9/projects/$VERCEL_LANDING_PAGE_PROJECT_ID` and use the helper.
- `The specified token is not valid` from `vercel link`: do not fall back to another vault key. Test project access and use the helper.
- `project_status` is not `200`: stop. Do not guess a project ID, token, team, or scope.
- The helper reports `ERROR` or `CANCELED`: stop, preserve the deployment ID, and report the Vercel error.

Keep `.vercel/` ignored. Never put credentials in this skill, the README, source files, deployment arguments, issue comments, or logs.
