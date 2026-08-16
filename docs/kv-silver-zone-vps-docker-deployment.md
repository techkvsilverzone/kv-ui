# KV Silver Zone UI — VPS Docker Deployment Task

## Objective

Prepare the KV Silver Zone Vite + React storefront for production deployment on the Hostinger KVM VPS using Docker.

Do NOT manually copy the local `dist/` folder to the VPS. The UI must be containerized and reproducibly deployable from the GitHub repository.

Current UI repository:
- Branch: `main`
- Current commit: `a4a66ca` — `Banner updates to single image again`
- Framework: Vite + React
- Build command: `npm run build`
- Canonical production API: `https://api.kvsilverzone.com/api/v1`

Keep the existing Vercel deployment untouched until the VPS deployment is fully validated.

---

## Target architecture

```text
Internet
   |
   +--> https://kvsilverzone.com
   |          |
   |        Host Nginx :443
   |          |
   |       127.0.0.1:8080
   |          |
   |       kvs-web Docker container
   |          |
   |       Nginx :80
   |          |
   |       React/Vite dist
   |
   +--> https://api.kvsilverzone.com
              |
           Host Nginx :443
              |
           Node.js :5000
              |
          PostgreSQL
```

Expected VPS structure:

```text
/opt/kvs/
├── api/
│   └── kv-api/
├── storage/
│   └── products/
└── web/
    └── kv-silver-zone/
```

The host Nginx already serves the API and product images. Do not break or unnecessarily modify the API configuration.

---

# Requirements

## 1. Production API configuration

The UI currently uses:

```env
VITE_API_URL=https://api.kvsilverzone.in/api/v1
```

Change the canonical production value to:

```env
VITE_API_URL=https://api.kvsilverzone.com/api/v1
```

There must be no production dependency on `onrender.com` or `api.kvsilverzone.in` for the primary storefront API configuration.

Do not hardcode the API URL elsewhere if the project already uses `VITE_API_URL`.

### Secrets

Check whether `.env` is tracked:

```bash
git ls-files .env
```

If `.env` is tracked, do not blindly commit it. Review `.gitignore` and repository conventions and move production configuration to an appropriate environment mechanism.

`.env.example` should document the expected variable without exposing secrets.

---

## 2. Dockerize the UI

Create a production multi-stage `Dockerfile`.

Recommended pattern:

```dockerfile
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Adjust only if the repository requires something different.

The final image must contain the built static application, not the development toolchain.

---

## 3. Container Nginx configuration

Create a UI-specific Nginx configuration, for example:

```text
nginx.conf
```

Requirements:
- Serve `/usr/share/nginx/html`
- `index.html` is the default document
- Support React Router client-side routes
- Unknown application routes fall back to `/index.html`
- Static assets should be cacheable
- Do not proxy API requests from the container
- Do not expose unnecessary Nginx information

Core behavior:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Adjust cache policy if the Vite asset naming strategy requires it.

---

## 4. Docker Compose

Create or update a suitable Compose configuration.

The UI container should:
- Be named `kvs-web`
- Restart automatically
- Listen internally on port 80
- Bind to the host loopback only:

```text
127.0.0.1:8080:80
```

Do NOT expose it publicly as `0.0.0.0:8080`.

Example:

```yaml
services:
  kvs-web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: kvs-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"
```

If the repository already has a Docker Compose convention, follow it rather than introducing conflicting conventions.

---

## 5. `.dockerignore`

Create/update `.dockerignore`.

At minimum exclude:

```text
node_modules
dist
.git
.gitignore
.env
.env.*
npm-debug.log*
README.md
```

Do not exclude files required by the Vite build.

---

## 6. Build-time environment handling

Vite embeds `VITE_*` variables during build. The production Docker build must receive:

```text
VITE_API_URL=https://api.kvsilverzone.com/api/v1
```

Use the cleanest repository-compatible mechanism.

A build argument is acceptable:

```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

Build:

```bash
docker build   --build-arg VITE_API_URL=https://api.kvsilverzone.com/api/v1   -t kvs-web:latest .
```

Do not invent a runtime environment mechanism for Vite variables after the build.

---

## 7. Local verification

Run:

```bash
npm ci
npm run build
npm test
npm run lint
```

Document any unrelated existing failures rather than hiding them.

Verify the generated bundle does NOT contain:

```text
api.kvsilverzone.in
onrender.com
```

and DOES contain:

```text
https://api.kvsilverzone.com/api/v1
```

---

## 8. Docker verification locally

Build:

```bash
docker build   --build-arg VITE_API_URL=https://api.kvsilverzone.com/api/v1   -t kvs-web:local .
```

Run:

```bash
docker run --rm   -p 8080:80   kvs-web:local
```

Verify:

```bash
curl -I http://127.0.0.1:8080/
```

Expected: `HTTP/1.1 200 OK`.

Also test an existing React Router route:

```bash
curl -I http://127.0.0.1:8080/<known-ui-route>
```

It must return the SPA rather than a 404.

---

## 9. VPS deployment

The VPS already has:

```text
/opt/kvs/api/kv-api
/opt/kvs/storage/products
```

Create:

```text
/opt/kvs/web/kv-silver-zone
```

Clone/pull the UI repository there.

Do NOT copy `dist` manually.

Build and start:

```bash
docker compose build
docker compose up -d
```

Verify:

```bash
docker ps
```

Then:

```bash
curl -I http://127.0.0.1:8080/
```

Expected: `HTTP/1.1 200 OK`.

---

## 10. Host Nginx

The host already has:

```text
api.kvsilverzone.com
api.kvsilverzone.in
```

Do not modify the API server block unnecessarily.

Create a separate Nginx site for:

```text
kvsilverzone.com
www.kvsilverzone.com
```

Initial HTTP configuration:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name kvsilverzone.com www.kvsilverzone.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Test:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Do not change DNS until the local Nginx path is working.

---

## 11. Pre-DNS validation

Before moving `kvsilverzone.com` away from Vercel, validate the VPS UI through Nginx.

If necessary, temporarily use a local hosts-file entry:

```text
200.141.6.59 kvsilverzone.com
200.141.6.59 www.kvsilverzone.com
```

Do NOT commit hosts-file changes.

Test:
- Homepage
- Product listing
- Product details
- Product images
- Category filters
- Search
- Cart
- Authentication
- User account
- Savings flows
- Payment-related UI
- Admin UI if applicable
- React Router refresh/deep links

The browser must call:

```text
https://api.kvsilverzone.com/api/v1/...
```

---

## 12. HTTPS

After HTTP validation and once DNS is ready, issue/expand Let's Encrypt for:

```text
kvsilverzone.com
www.kvsilverzone.com
```

Do not unnecessarily modify the existing API certificate.

Final domains:

```text
https://kvsilverzone.com
https://www.kvsilverzone.com
https://api.kvsilverzone.com
https://api.kvsilverzone.in
```

The storefront canonical domain is:

```text
https://kvsilverzone.com
```

---

## 13. DNS cutover

Only after the VPS UI is fully validated, change the GoDaddy storefront DNS from Vercel to:

```text
A    @      200.141.6.59
A    www    200.141.6.59
```

Use the existing DNS strategy if `www` is configured differently, but the final result must route both storefront hostnames to the VPS.

Do not modify:

```text
api.kvsilverzone.com
api.kvsilverzone.in
```

---

## 14. Keep Vercel during cutover

Do NOT delete the Vercel project immediately.

Keep it available until:
- DNS has propagated
- Production storefront works
- API calls work
- Authentication works
- Images work
- Routing/deep links work
- Mobile/responsive UI works
- Payment flows are smoke-tested
- No major browser-console errors exist

Then Vercel can be retired after a reasonable observation period.

---

## 15. Reproducible deployment

The end state should support:

```bash
git pull
docker compose build
docker compose up -d
```

Prefer CI/CD later.

Do not introduce manual SCP-based deployment.

---

## 16. Git requirements

Commit deployment artifacts such as:

```text
Dockerfile
nginx.conf
.dockerignore
docker-compose.yml       # if repository-owned
.env.example             # only if needed
```

Do NOT commit:

```text
.env
node_modules/
dist/
secrets
production credentials
```

Use a clear commit message:

```text
Dockerize storefront for VPS deployment
```

Push to `main` unless repository workflow requires a PR.

---

# Acceptance Criteria

- [ ] Vite build succeeds
- [ ] Tests pass
- [ ] Lint passes or known failures are documented
- [ ] Docker image builds successfully
- [ ] UI container starts successfully
- [ ] UI is reachable on `127.0.0.1:8080`
- [ ] React Router fallback works
- [ ] UI does not reference Render
- [ ] Production API is `https://api.kvsilverzone.com/api/v1`
- [ ] Host Nginx proxies storefront traffic to `127.0.0.1:8080`
- [ ] Existing API Nginx configuration remains functional
- [ ] Product images remain functional
- [ ] HTTPS works for the storefront
- [ ] `kvsilverzone.com` points to the VPS
- [ ] Vercel remains available during rollback period
- [ ] No secrets are committed
- [ ] Changes are committed and pushed to GitHub

---

# Operational constraints

1. Do NOT delete the Vercel deployment during this task.
2. Do NOT change the API deployment.
3. Do NOT modify PostgreSQL.
4. Do NOT modify `/opt/kvs/storage/products`.
5. Do NOT manually copy `dist` to the VPS.
6. Do NOT expose UI port `8080` publicly.
7. Do NOT change API DNS records.
8. Do NOT commit `.env` or secrets.
9. Preserve application behavior; this is deployment/infrastructure work, not a UI rewrite.
10. Do not change application code unless required for the Docker/Vite production deployment.

---

# Final report

At the end, report:

1. Files added/changed
2. Docker build result
3. Local test/build/lint results
4. Docker container status
5. VPS deployment commands used
6. Nginx configuration added
7. Production API URL used
8. DNS changes required
9. Issues or deviations
10. Git commit hash
11. Whether Vercel should remain active for rollback
