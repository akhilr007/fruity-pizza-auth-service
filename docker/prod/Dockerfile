# Stage 1: Builder
FROM node:20.17-alpine AS builder

# Install build dependencies (Python, make, g++) for bcrypt
RUN apk add --no-cache python3 make g++

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies) for building
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application (assuming you have a build script)
RUN npm run build

# Stage 2: Production
FROM node:20.17-alpine AS production

# Set Node environment to production
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/dist ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose the port that the app will run on
EXPOSE 5555

# Start the application from dist folder
CMD [ "node", "src/server.js" ]

