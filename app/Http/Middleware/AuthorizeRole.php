<?php

namespace App\Http\Middleware;

use Closure;

class AuthorizeRole
{
    public function handle($request, Closure $next, ...$roles)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        // Verificar si el rol del usuario está permitido
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'error' => 'No autorizado. Se requiere rol: ' . implode(' o ', $roles)
            ], 403);
        }

        return $next($request);
    }
}
