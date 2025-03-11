# Utiliser une image de base officielle de Node.js
FROM node:18-alpine

# Installer pnpm
RUN npm install -g pnpm

# Installer wakeonlan
RUN apk add --no-cache awake

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier package.json et le fichier pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install

# Copier le reste de l'application
COPY . .

# Exposer le port sur lequel l'application va tourner
EXPOSE 3000

# Commande pour lancer l'application
CMD ["pnpm", "start"]
