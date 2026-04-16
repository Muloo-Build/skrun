FROM node:20-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json biome.json ./
COPY README.md CHANGELOG.md CONTRIBUTING.md LICENSE SECURITY.md .env.example vitest.config.e2e.ts ./
COPY docs ./docs
COPY examples ./examples
COPY packages ./packages

RUN pnpm install --frozen-lockfile
RUN pnpm build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

EXPOSE 4000

CMD ["pnpm", "start"]
