# Stage 1: Build the React app
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine

# Default to docker-compose service name; override on other hosts (e.g. Railway)
ENV BACKEND_HOST=backend
# The nginx image expects a variable NAME (no $); it builds "${BACKEND_HOST}"
# and substitutes only that at boot, leaving nginx runtime vars untouched.
ENV NGINX_ENVSUBST_FILTER=BACKEND_HOST

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]