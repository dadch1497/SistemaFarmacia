FROM php:8.2-cli-alpine

# Instalar extensiones necesarias para UBL 2.1 y SOAP
RUN apk add --no-cache libxml2-dev openssl-dev bash curl \
    && docker-php-ext-install soap

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json ./
RUN composer install --no-dev --prefer-dist --no-interaction --ignore-platform-reqs || true

COPY . .

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://127.0.0.1:80/health || exit 1

CMD ["php", "-S", "0.0.0.0:80", "-t", "public"]
