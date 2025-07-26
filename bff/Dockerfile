# 1) Build stage usando sempre a última versão do Node
FROM node:latest AS builder

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia apenas package.json e package-lock.json
COPY package.json package-lock.json ./

# Instala dependências conforme lockfile
RUN npm ci

# Copia todo o código e assets
COPY . .

# Compila TypeScript (assume que seu build gera dist/)
RUN npm run build

# 2) Runtime stage enxuto
FROM node:latest AS runner

WORKDIR /usr/src/app

# Copia só o manifestos e instala só production
COPY package.json package-lock.json ./
RUN npm ci --production

# Copia o build compilado
COPY --from=builder /usr/src/app/dist ./dist

# Se tiver assets estáticos (public, views etc.), copie também:
# COPY --from=builder /usr/src/app/public ./public

# Exponha a porta do BFF (3000)
EXPOSE 3000

# Se tiver um script no package.json, ex: "start:prod": "node dist/main.js",
# você pode usar: CMD ["npm", "run", "start:prod"]
# Caso contrário, use:
CMD ["node", "dist/main.js"]
