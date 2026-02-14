# Utiliser une image de base officielle de Node.js
FROM node:24-alpine

# Installer pnpm
RUN npm install -g pnpm

# Installer tini pour gérer les processus zombies
RUN apk add --no-cache tini

# Installer wakeonlan
RUN apk add python3 py3-pip
RUN pip install --break-system-packages wakeonlan


# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier package.json et le fichier pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install


# Copier le reste de l'application
COPY . .

# Build l'application
RUN pnpm build

# Exposer le port sur lequel l'application va tourner
EXPOSE 3001

# Utiliser tini comme entrypoint pour éviter les processus zombies
ENTRYPOINT ["/sbin/tini", "--"]

# Commande pour lancer l'application
CMD ["pnpm", "start"]
