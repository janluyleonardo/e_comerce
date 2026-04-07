<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# E-Commerce API - Laravel

Este proyecto es una API de e-commerce construida con Laravel. Proporciona funcionalidades para gestionar productos y usuarios.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes componentes en tu sistema:

- PHP >= 8.0
- Composer
- postgreSQL
- Git

## Pasos para Clonar y Ejecutar el Proyecto en Local

### 1. Clonar el Repositorio

Clona el repositorio desde GitHub:

```bash
git clone https://github.com/janluyleonardo/e_comerce.git
cd e_comerce
```

### 2. Instalar Dependencias de PHP

Instala las dependencias de PHP usando Composer:

```bash
composer install
```

### 3. Configurar el Archivo de Entorno

Copia el archivo de ejemplo de configuración de entorno:

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura las variables necesarias, especialmente la conexión a la base de datos:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=e_comerce
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
AUTH_GUARD=api
```

### 4. Generar la Clave de la Aplicación

Genera una clave única para la aplicación:

```bash
php artisan key:generate
```

### 5. Configurar la Base de Datos

Asegúrate de que tu base de datos esté creada y configurada. Luego, ejecuta las migraciones para crear las tablas:

```bash
php artisan migrate
```

Opcionalmente, ejecuta los seeders para poblar la base de datos con datos de ejemplo:

```bash
php artisan db:seed
```

Para producción:

```bash
npm run build
```

### 6. Ejecutar el Servidor de Desarrollo

Inicia el servidor de desarrollo de Laravel:

```bash
php artisan serve
```

La aplicación estará disponible en `http://localhost:8000`.

## Pruebas

### Ejecutar Pruebas Unitarias y de Características

Ejecuta las pruebas con PHPUnit:

```bash
php artisan test
```

### Probar la API con Postman

Importa la colección de Postman incluida en el proyecto: `ecomerceAPI.postman_collection.json`.

Configura el entorno en Postman con la URL base `http://localhost:8000/api` y realiza las pruebas de los endpoints.

## Estructura del Proyecto

- `app/Http/Controllers/`: Controladores de la API
- `app/Models/`: Modelos de Eloquent (Product, User)
- `database/migrations/`: Migraciones de base de datos
- `routes/api.php`: Rutas de la API
- `tests/`: Pruebas unitarias y de características

## Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Realiza tus cambios y confirma: `git commit -m "Agrega nueva funcionalidad"`
3. Envía un pull request

## Licencia

Este proyecto está bajo la Licencia MIT.

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
