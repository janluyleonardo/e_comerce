import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/product_provider.dart';
import '../providers/cart_provider.dart';
import '../providers/socket_provider.dart';
import '../widgets/product_card.dart';
import './profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  bool _isInit = true;

  @override
  void didChangeDependencies() {
    if (_isInit) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final token = auth.token;
      if (token != null) {
        Provider.of<ProductProvider>(context, listen: false).fetchProducts(token);
        Provider.of<SocketProvider>(context, listen: false).connect(token);
      }
      _isInit = false;
    }
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    final socket = Provider.of<SocketProvider>(context);

    final List<Widget> screens = [
      _buildHomeContent(user),
      _buildActivityContent(socket),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _selectedIndex == 0 
        ? AppBar(
            title: const Text(
              'E-Comerce',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            centerTitle: true,
            elevation: 0,
            backgroundColor: Colors.transparent,
            actions: [
              Consumer<CartProvider>(
                builder: (_, cart, ch) => Badge(
                  label: Text('${cart.itemCount}'),
                  isLabelVisible: cart.itemCount > 0,
                  offset: const Offset(-5, 5),
                  child: ch,
                ),
                child: IconButton(
                  icon: const Icon(Icons.shopping_cart_outlined),
                  onPressed: () => Navigator.pushNamed(context, '/cart'),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: () {
                  final token = Provider.of<AuthProvider>(context, listen: false).token;
                  if (token != null) {
                    Provider.of<ProductProvider>(context, listen: false).fetchProducts(token);
                  }
                },
              ),
            ],
          )
        : (_selectedIndex == 1 
            ? AppBar(
                title: const Text('Actividad en Vivo', style: TextStyle(fontWeight: FontWeight.bold)),
                centerTitle: true,
                actions: [
                  IconButton(
                    icon: const Icon(Icons.delete_sweep_outlined),
                    onPressed: () => socket.clearNotifications(),
                  ),
                ],
              )
            : null),
      body: screens[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) => setState(() => _selectedIndex = index),
          selectedItemColor: const Color(0xFF6366F1),
          unselectedItemColor: Colors.grey,
          showUnselectedLabels: true,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.shopping_bag_outlined),
              activeIcon: Icon(Icons.shopping_bag),
              label: 'Tienda',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.notifications_none),
              activeIcon: Icon(Icons.notifications),
              label: 'Vivo',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Perfil',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityContent(SocketProvider socket) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
          color: socket.isConnected ? Colors.green.shade50 : Colors.red.shade50,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  color: socket.isConnected ? Colors.green : Colors.red,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                socket.isConnected ? 'Conectado al Servidor' : 'Sin conexión',
                style: TextStyle(
                  color: socket.isConnected ? Colors.green.shade900 : Colors.red.shade900,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: socket.notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.bolt, size: 80, color: Colors.grey.shade200),
                      const SizedBox(height: 10),
                      const Text('Esperando actividad...', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: socket.notifications.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 15),
                  itemBuilder: (ctx, i) {
                    final note = socket.notifications[i];
                    return Container(
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(color: Colors.grey.shade100),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: const Color(0xFF6366F1).withOpacity(0.1),
                            child: const Icon(Icons.flash_on, color: Color(0xFF6366F1)),
                          ),
                          const SizedBox(width: 15),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  note['user'] ?? 'Sistema',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                Text(note['text'] ?? 'Nuevo aviso recibido'),
                              ],
                            ),
                          ),
                          Text(
                            'Ahora',
                            style: TextStyle(fontSize: 10, color: Colors.grey.shade400),
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(20),
          child: TextField(
            onSubmitted: (val) {
              if (val.isNotEmpty) {
                socket.sendMessage(val);
              }
            },
            decoration: InputDecoration(
              hintText: 'Enviar mensaje al canal vivo...',
              suffixIcon: const Icon(Icons.send),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
              filled: true,
              fillColor: Colors.grey.shade50,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHomeContent(user) {
    final productData = Provider.of<ProductProvider>(context);
    final products = productData.products;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Hola 👋',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                  Text(
                    user?.name ?? 'Usuario',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (user?.role == 'admin')
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.admin_panel_settings, size: 18, color: Colors.amber.shade900),
                      const SizedBox(width: 4),
                      Text(
                        'Admin',
                        style: TextStyle(
                          color: Colors.amber.shade900,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 30),
          
          if (user?.role == 'admin') ...[
            _buildAdminDashboard(),
            const SizedBox(height: 30),
          ],

          const Text(
            'Productos Destacados',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          
          if (productData.isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(40.0),
                child: CircularProgressIndicator(),
              ),
            )
          else if (products.isEmpty)
            Center(
              child: Column(
                children: [
                  Icon(Icons.inventory_2_outlined, size: 80, color: Colors.grey.shade300),
                  const SizedBox(height: 10),
                  const Text('No hay productos disponibles', style: TextStyle(color: Colors.grey)),
                ],
              ),
            )
          else
            GridStream(products: products),
        ],
      ),
    );
  }

  Widget GridStream({required List products}) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: products.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.7,
        crossAxisSpacing: 15,
        mainAxisSpacing: 15,
      ),
      itemBuilder: (context, index) {
        final product = products[index];
        return ProductCard(
          product: product,
          onTap: () {
            // Navegar a Detalle
            Navigator.pushNamed(
              context, 
              '/product-detail',
              arguments: product.id,
            );
          },
        );
      },
    );
  }

  Widget _buildAdminDashboard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF6366F1),
        borderRadius: BorderRadius.circular(25),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Panel de Gestión',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 15),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildAdminAction(Icons.add_box, 'Añadir'),
              _buildAdminAction(Icons.analytics, 'Ventas'),
              _buildAdminAction(Icons.people, 'Usuarios'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAdminAction(IconData icon, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(15),
          ),
          child: Icon(icon, color: Colors.white),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(color: Colors.white, fontSize: 12),
        ),
      ],
    );
  }
}
