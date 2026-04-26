#!/bin/bash

# Esperar un momento para asegurar que la DB esté lista (opcional)
echo "Running migrations..."
php artisan migrate:fresh

echo "Starting Apache..."
apache2-foreground
