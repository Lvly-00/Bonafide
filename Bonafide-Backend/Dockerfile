FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    curl \
    git \
    unzip \
    bash

RUN apk add --no-cache postgresql-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN mkdir -p storage/framework/views storage/framework/cache storage/framework/sessions storage/logs \
    && chmod -R 775 storage bootstrap/cache

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE ${PORT:-8000}

CMD ["/usr/local/bin/docker-entrypoint.sh"]