# 1) Build stage usando sempre a última versão do Node
FROM node:latest AS builder

# Define diretório de trabalho
WORKDIR /usr/src/app

# Copia apenas os manifestos para instalar dependências
COPY package.json package-lock.json ./

# Instala dependências exatamente conforme package-lock (sem node_modules local)
RUN npm ci

# Copia todo o resto do código e assets
COPY . .

# Compila TypeScript para JavaScript em dist/
RUN npm run build

# 2) Runtime stage enxuto
FROM node:latest AS runner

WORKDIR /usr/src/app

# Copia manifestos novamente e instala apenas produção
COPY package.json package-lock.json ./
RUN npm ci --production

# Puxa o build compilado do builder
COPY --from=builder /usr/src/app/dist ./dist

# Se existirem assets estáticos, por exemplo:
# COPY --from=builder /usr/src/app/public ./public

# Exponha a porta usada pela aplicação (ajuste se diferente, ex: 3000 para BFF)
EXPOSE 8080

# Comando padrão para iniciar o NestJS
CMD ["node", "dist/main.js"]
