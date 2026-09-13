#################### BUILD STAGE ####################

# Start build stage using node22 image
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Disable Next.js telemetry (anonymous usage reporting) to avoid unnecessary outbound data transmision
ENV NEXT_TELEMETRY_DISABLED=1

# Installing OpenSSL as Prisma needs it while generating its client and building the application
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy dependencies and run clean install
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Copy application source
COPY . .

# Placeholder env variables are needed during build for successful env validations
# These exists only during build
ARG BUILD_JWT_SECRET = artistically-build-only-placeholder-rotate-not-a-runtime-secret
ENV JWT_SECRET = ${BUILD_JWT_SECRET}
ARG BUILD_DATABASE_URL = postgresql://build:build@localhost:5432/build?schema=public
ENV DATABASE_URL = ${BUILD_DATABASE_URL}

# Run the production build 
RUN npm run build


#################### RUNTIME STAGE ####################

# Start runtime stage using fresh node22 image
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

# App uses it to enable secure cookies, persistent rate limiting, and production runtime behavior
ENV NODE_ENV=production

# Disable Next.js telemetry (anonymous usage reporting) to avoid unnecessary outbound data transmision
ENV NEXT_TELEMETRY_DISABLED=1

# Needed for hosting
ENV HOSTNAME=0.0.0.0

# Prisma's runtime engine also needs OpenSSL
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# Adding nextjs user to keep the application process isolated from root privileges
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone output excludes public and static assets, copying them explicitly
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# User nextjs used to run commands
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
