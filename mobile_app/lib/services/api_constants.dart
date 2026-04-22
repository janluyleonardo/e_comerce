import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io' show Platform;

class ApiConstants {
  static String get baseUrl {
    if (kIsWeb) {
      return "http://localhost:8000/api";
    }
    try {
      if (Platform.isAndroid) {
        return "http://10.0.2.2:8000/api";
      }
    } catch (e) {
      // Fallback para otras plataformas
    }
    return "http://localhost:8000/api";
  }
  
  static String get loginEndpoint => "$baseUrl/auth/login";
  static String get signupEndpoint => "$baseUrl/auth/signup";
  static String get productsEndpoint => "$baseUrl/products";

  static String get socketUrl {
    if (kIsWeb) {
      return "http://localhost:6001";
    }
    try {
      if (Platform.isAndroid) {
        return "http://10.0.2.2:6001";
      }
    } catch (e) {}
    return "http://localhost:6001";
  }
}
