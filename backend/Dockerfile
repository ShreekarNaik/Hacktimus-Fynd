# ---- Build client ----
    FROM node:20-alpine AS client-build
    WORKDIR /app
    COPY client/package*.json ./client/
    RUN cd client && npm ci
    COPY client ./client
    RUN cd client && npm run build
    
    # ---- Runtime (server) ----
    FROM node:20-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    
    # Install server deps
    COPY server/package*.json ./server/
    RUN cd server && npm ci --omit=dev
    
    # Copy server code and built client
    COPY server ./server
    COPY --from=client-build /app/client/dist ./client/dist
    
    # Let server know where the build is
    ENV REACT_BUILD_DIR=../client/dist
    
    # Boltic uses PORT; default in app code should be 8080
    EXPOSE 8080
    CMD ["node", "server/server.js"]
    