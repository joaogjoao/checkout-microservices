# 1) Build stage (com todas as dependências, incluindo devDependencies)
FROM node:latest AS builder

# Defina o contexto e variáveis de ambiente
WORKDIR /usr/src/app
ENV NODE_ENV=development

# Copia apenas manifestos para cache de dependências
COPY package.json package-lock.json ./

# Instala tudo (dev + prod)
RUN npm ci

# Copia o restante do código
COPY . .

# Compila o TypeScript
RUN npm run build

# 2) Runtime stage (somente produção)
FROM node:latest AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copia somente manifestos para instalar só prod deps
COPY package.json package-lock.json ./

# Instala apenas produção
RUN npm ci --only=production

# (Opcional) copie seu .env local se quiser ter valores padrão
# COPY .env.example .env

# Traga o build pronto
COPY --from=builder /usr/src/app/dist ./dist

# Expõe a porta da aplicação
EXPOSE 8080

# Comando para iniciar em produção
CMD ["node", "dist/main.js"]
