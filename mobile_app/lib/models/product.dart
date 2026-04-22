class Product {
  final int id;
  final String name;
  final String? description;
  final double price;
  final bool isActive;
  final bool discontinued;
  final int stock;
  final String? imageUrl;
  final String? creatorName;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.isActive,
    required this.discontinued,
    required this.stock,
    this.imageUrl,
    this.creatorName,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: double.parse(json['price'].toString()),
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      discontinued: json['discontinued'] == 1 || json['discontinued'] == true,
      stock: json['stock'] ?? 0,
      imageUrl: json['image_url'],
      creatorName: json['creator'] != null ? json['creator']['name'] : 'Sistema',
    );
  }
}
