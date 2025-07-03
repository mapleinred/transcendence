#FROM node:18 AS build
#COPY ./frontend /app
#WORKDIR /app
#RUN npm i vite && npm i && npm run build:css

#FROM node:18dist
#WORKDIR /app
#COPY ./backend /app
#COPY --from=build /app/public /app
#CMD ["node", "index.js"]


# Stage 1: Build frontend
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
#COPY vite.config.js ./

#install typescript
RUN npm install -g typescript
RUN npm install
COPY . .
#COPY vite.config.js ./
RUN npm run build

# Stage 2: Serve from backend
FROM node:18
WORKDIR /app
#RUN mkdir -p /app/public/{css,js}
#COPY --from=builder /app/dist /app/public
COPY --from=builder /app/dist /app/public/dist
COPY --from=builder /app/ /app/public 
#COPY --from=builder /app/dist/assets /app/public/src
#COPY --from=builder /app/dist/assets/index.js  /app/public/src/main.js
#COPY --from=builder /app/dist/assets/index.css /app/public/dist/styles.css
#RUN mv /app/public/src/index.js /app/public.src/main.js
#COPY --from=builder /app /app/public/1
#COPY --from=builder /app/src  /app/public/src 

#COPY --from=builder /app/index.html /app/public
#COPY --from=builder /app/src/main.ts /app/public
#COPY --from=builder /app/public/pong_gameAll.html /app/public/src
#COPY ./src/main.ts /app/public/


RUN chown -R node:node /app/public

USER node

HEALTHCHECK --interval=30s --timeout=3s \
    CMD curl -f https://localhost:3001/ || exit 1
