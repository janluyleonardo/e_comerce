class User {
  final int id;
  final String name;
  final String email;
  final String role;
  final int productsCount;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.productsCount = 0,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      role: json['role'] ?? 'client',
      productsCount: json['products_count'] ?? 0,
    );
  }
}
