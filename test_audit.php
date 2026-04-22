<?php

use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// 1. Crear/Obtener usuario "Arturo"
$user = User::firstOrCreate(
    ['email' => 'arturo@test.com'],
    ['name' => 'Arturo', 'password' => bcrypt('password'), 'role' => 'admin']
);

echo "Usuario: " . $user->name . " (ID: " . $user->id . ")\n";

// 2. Simular Login
auth()->login($user);

// 3. Crear Producto (Auditado)
$product = Product::create([
    'name' => 'Laptop Pro X ' . rand(100, 999),
    'description' => 'Producto de prueba para auditar',
    'price' => 1500.00,
    'stock' => 5,
    'created_by' => auth()->id()
]);

echo "Producto Creado: " . $product->name . "\n";
echo "ID del Creador en BD: " . $product->created_by . "\n";

// 4. Consultar con relación
$consulted = Product::with('creator')->find($product->id);
echo "Creador recuperado vía relación: " . ($consulted->creator->name ?? 'No encontrado') . "\n";

if ($consulted->created_by === $user->id) {
    echo "✅ ÉXITO: El producto quedó asociado correctamente a Arturo.\n";
} else {
    echo "❌ ERROR: La asociación falló.\n";
}
