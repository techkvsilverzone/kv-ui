FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_RAZORPAY_KEY_ID
ARG VITE_SENTRY_DSN
ARG VITE_GA4_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_GA4_ID=$VITE_GA4_ID

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]