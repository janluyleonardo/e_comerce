class CartItem {
  final String id;
  final int productId;
  final String name;
  final int quantity;
  final double price;
  final String? imageUrl;

  CartItem({
    required this.id,
    required this.productId,
    required this.name,
    required this.quantity,
    required this.price,
    this.imageUrl,
  });
}
