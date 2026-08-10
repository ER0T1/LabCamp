#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
docker compose --profile certbot run --rm certbot renew --webroot -w /var/www/certbot --quiet
docker compose exec nginx nginx -s reload
