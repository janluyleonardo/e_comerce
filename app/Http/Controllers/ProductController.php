<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('creator:id,name')->get()->map(function ($product) {
            if ($product->creator) {
                $product->creator->username = $product->creator->name;
                unset($product->creator->name);
            }
            return $product;
        });
        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with('creator:id,name')->find($id);
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }
        if ($product->creator) {
            $product->creator->username = $product->creator->name;
            unset($product->creator->name);
        }
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'discontinued' => 'boolean',
            'stock' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['created_by'] = auth()->id(); // Tracing the authenticated user

        $product = Product::create($data);
        $product->load('creator:id,name');
        if ($product->creator) {
            $product->creator->username = $product->creator->name;
            unset($product->creator->name);
        }
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'is_active' => 'boolean',
            'discontinued' => 'boolean',
            'stock' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }

        $product->delete();
        return response()->json(['message' => 'Producto eliminado exitosamente']);
    }
}
