import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../services/api_constants.dart';

class SocketProvider with ChangeNotifier {
  IO.Socket? _socket;
  bool _isConnected = false;
  List<Map<String, dynamic>> _notifications = [];

  bool get isConnected => _isConnected;
  List<Map<String, dynamic>> get notifications => [..._notifications];

  void connect(String token) {
    if (_socket != null && _socket!.connected) return;

    _socket = IO.io(ApiConstants.socketUrl, 
      IO.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .enableAutoConnect()
        .build()
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      print('Socket Conectado');
      notifyListeners();
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      print('Socket Desconectado');
      notifyListeners();
    });

    _socket!.onConnectError((data) => print('Error de Conexión: $data'));

    // Escuchar historial al entrar (Actividad 3)
    _socket!.on('messages', (data) {
      if (data is List) {
        _notifications = List<Map<String, dynamic>>.from(
          data.map((item) => Map<String, dynamic>.from(item))
        ).reversed.toList(); // Invertir para que el más nuevo esté arriba según la UI actual
        notifyListeners();
      }
    });

    // Escuchar nuevos mensajes
    _socket!.on('message', (data) {
      _notifications.insert(0, data);
      notifyListeners();
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _isConnected = false;
    _notifications = [];
  }

  void sendMessage(String text) {
    if (_socket != null && _socket!.connected) {
      _socket!.emit('new-message', text);
    }
  }

  void clearNotifications() {
    _notifications = [];
    notifyListeners();
  }
}
