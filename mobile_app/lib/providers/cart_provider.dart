import 'package:flutter/material.dart';
import '../models/cart_item.dart';

class CartProvider with ChangeNotifier {
  Map<String, CartItem> _items = {};

  Map<String, CartItem> get items => {..._items};

  int get itemCount => _items.length;

  double get totalAmount {
    var total = 0.0;
    _items.forEach((key, cartItem) {
      total += cartItem.price * cartItem.quantity;
    });
    return total;
  }

  void addItem(int productId, String name, double price, String? imageUrl) {
    if (_items.containsKey(productId.toString())) {
      _items.update(
        productId.toString(),
        (existing) => CartItem(
          id: existing.id,
          productId: existing.productId,
          name: existing.name,
          price: existing.price,
          quantity: existing.quantity + 1,
          imageUrl: existing.imageUrl,
        ),
      );
    } else {
      _items.putIfAbsent(
        productId.toString(),
        () => CartItem(
          id: DateTime.now().toString(),
          productId: productId,
          name: name,
          price: price,
          quantity: 1,
          imageUrl: imageUrl,
        ),
      );
    }
    notifyListeners();
  }

  void removeItem(int productId) {
    _items.remove(productId.toString());
    notifyListeners();
  }

  void removeSingleItem(int productId) {
    if (!_items.containsKey(productId.toString())) return;
    
    if (_items[productId.toString()]!.quantity > 1) {
      _items.update(
        productId.toString(),
        (existing) => CartItem(
          id: existing.id,
          productId: existing.productId,
          name: existing.name,
          price: existing.price,
          quantity: existing.quantity - 1,
          imageUrl: existing.imageUrl,
        ),
      );
    } else {
      _items.remove(productId.toString());
    }
    notifyListeners();
  }

  void clear() {
    _items = {};
    notifyListeners();
  }
}
