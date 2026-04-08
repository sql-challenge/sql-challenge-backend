# ═══════════════════════════════════════════════════════════════
#  Stage 1 · base — imagem comum a todos os estágios
# ═══════════════════════════════════════════════════════════════
FROM node:20-alpine AS base
WORKDIR /app

# ═══════════════════════════════════════════════════════════════
#  Stage 2 · deps — todas as dependências (dev + prod)
#  Reutilizado por builder
# ═══════════════════════════════════════════════════════════════
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ═══════════════════════════════════════════════════════════════
#  Stage 3 · deps-prod — apenas dependências de produção
#  Reutilizado por runner (imagem final mais enxuta)
# ═══════════════════════════════════════════════════════════════
FROM base AS deps-prod
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ═══════════════════════════════════════════════════════════════
#  Stage 4 · builder — compila o TypeScript
#  Depende de: deps (precisa de devDependencies para compilar)
# ═══════════════════════════════════════════════════════════════
FROM deps AS builder
COPY . .
RUN npm run build

# ═══════════════════════════════════════════════════════════════
#  Stage 5 · runner — imagem de produção mínima
#  Depende de: builder (dist/) + deps-prod (node_modules enxuto)
# ═══════════════════════════════════════════════════════════════
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nodejs

COPY --from=deps-prod --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder   --chown=nodejs:nodejs /app/dist         ./dist
COPY --from=builder   --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs
EXPOSE 3000
CMD ["npm", "start"]
