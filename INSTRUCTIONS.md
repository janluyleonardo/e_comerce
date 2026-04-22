# 🚀 Guía de Instalación y Ejecución - E-Comerce Fullstack

Este proyecto es un ecosistema completo que incluye una API en Laravel, un servidor de notificaciones en Node.js, un frontend web en React y una aplicación móvil en Flutter.

## 📥 Clonación del Proyecto

```bash
git clone https://github.com/janluyleonardo/e_comerce.git
cd e_comerce
```

## 📋 Requisitos Previos

Asegúrate de tener instalado lo siguiente:
*   **PHP** >= 8.2 & **Composer**
*   **Node.js** >= 18 & **npm**
*   **PostgreSQL** (Base de datos principal)
*   **Flutter SDK** (Para la app móvil)
*   **XAMPP/Laragon** (Opcional, para gestionar el entorno PHP/DB en Windows)

---

## 🛠️ Paso 1: Configuración del Backend (Laravel)

1.  Entra a la carpeta raíz del proyecto.
2.  Instala las dependencias de PHP:
    ```bash
    composer install
    ```
3.  Configura el archivo de entorno:
    *   Copia `.env.example` a `.env`.
    *   Configura tus credenciales de base de datos en `.env` (DB_DATABASE, DB_USERNAME, DB_PASSWORD).
4.  Genera la clave de la aplicación:
    ```bash
    php artisan key:generate
    ```
5.  Ejecuta las migraciones y los seeders (para tener productos de prueba):
    ```bash
    php artisan migrate --seed
    ```
6.  Inicia el servidor backend:
    ```bash
    php artisan serve
    ```
    *Servidor activo en: http://127.0.0.1:8000*

---

## 🔌 Paso 2: Servidor de Sockets (Node.js)

Este servidor maneja las notificaciones y el chat en vivo.

1.  Desde la raíz del proyecto, instala las dependencias:
    ```bash
    npm install
    ```
2.  Inicia el servidor de sockets:
    ```bash
    node socket-server.js
    ```
    *Servidor activo en: http://localhost:6001*

---

## 💻 Paso 3: Frontend Web (React + Vite)

1.  Navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el entorno de desarrollo:
    ```bash
    npm run dev
    ```
    *Acceso web en: http://localhost:5173*

---

## 📱 Paso 4: Aplicación Móvil (Flutter)

1.  Navega a la carpeta de la app móvil:
    ```bash
    cd mobile_app
    ```
2.  Obtén los paquetes necesarios:
    ```bash
    flutter pub get
    ```
3.  Ejecuta la aplicación:
    *   **Para Web:** `flutter run -d chrome`
    *   **Para Android (Emulador):** `flutter run`
    *   *Nota: La app está configurada para detectar automáticamente si usas localhost (Web) o 10.0.2.2 (Android).*

---

## 📝 Notas Adicionales

*   **Credenciales de Prueba:** Si ejecutaste el `--seed`, puedes usar cualquier usuario de la tabla `users` o crear uno nuevo desde la pantalla de Registro de la App.
*   **Roles:** El sistema diferencia entre `admin` y `client`. Puedes cambiar el rol de un usuario directamente en la base de datos para ver el panel de administración en el móvil.
*   **JWT:** La seguridad se maneja mediante tokens JWT compartidos entre Laravel, el Socket Server y las aplicaciones cliente.
