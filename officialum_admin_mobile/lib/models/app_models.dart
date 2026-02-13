import 'dart:convert';

class Product {
  final String id;
  final String name;
  final String? category;
  final double price;
  final int stock;
  final String? image;
  final String platform;

  Product({
    required this.id,
    required this.name,
    this.category,
    required this.price,
    required this.stock,
    this.image,
    required this.platform,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      category: json['category'],
      price: double.tryParse(json['price']?.toString() ?? '0') ?? 0.0,
      stock: int.tryParse(json['stock']?.toString() ?? '0') ?? 0,
      image: json['image'],
      platform: json['platform'] ?? 'Website',
    );
  }
}

class Order {
  final String id;
  final String productName;
  final double amount;
  final String status;
  final String date;
  final String? userEmail;

  Order({
    required this.id,
    required this.productName,
    required this.amount,
    required this.status,
    required this.date,
    this.userEmail,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['orderId']?.toString() ?? json['id']?.toString() ?? '',
      productName: json['product_name'] ?? 'Unknown Product',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      status: json['status'] ?? 'pending',
      date: json['date'] ?? '',
      userEmail: json['user_email'],
    );
  }
}

class G2GOrder {
  final String orderId;
  final String productName;
  final double amount;
  final String status;
  final String updatedAt;

  G2GOrder({
    required this.orderId,
    required this.productName,
    required this.amount,
    required this.status,
    required this.updatedAt,
  });

  factory G2GOrder.fromJson(Map<String, dynamic> json) {
    return G2GOrder(
      orderId: json['order_id'] ?? '',
      productName: json['product_name'] ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      status: json['status'] ?? 'Paid',
      updatedAt: json['updated_at'] ?? '',
    );
  }
}

class PlayerUpListing {
  final String id;
  final String title;
  final String url;
  final String platform;
  final String? lastBumped;
  final String status;
  final String frequency;
  final bool autoBump;

  PlayerUpListing({
    required this.id,
    required this.title,
    required this.url,
    required this.platform,
    this.lastBumped,
    required this.status,
    required this.frequency,
    required this.autoBump,
  });

  factory PlayerUpListing.fromJson(Map<String, dynamic> json) {
    return PlayerUpListing(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      url: json['url'] ?? '',
      platform: json['platform'] ?? 'Social',
      lastBumped: json['lastBumped'],
      status: json['status'] ?? 'Inactive',
      frequency: json['frequency'] ?? 'Every 24 hours',
      autoBump: json['autoBump'] == 1 || json['autoBump'] == true,
    );
  }
}
class StockItem {
  final String id;
  final String name;
  final String platform;
  final double purchasePrice;
  final String status;
  final String? accountEmail;
  final String? accountUsername;
  final String? image;
  final Map<String, dynamic> accountDetails;

  StockItem({
    required this.id,
    required this.name,
    required this.platform,
    required this.purchasePrice,
    required this.status,
    this.accountEmail,
    this.accountUsername,
    this.image,
    required this.accountDetails,
  });

  factory StockItem.fromJson(Map<String, dynamic> json) {
    return StockItem(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      platform: json['platform'] ?? '',
      purchasePrice: double.tryParse(json['purchasePrice']?.toString() ?? '0') ?? 0.0,
      status: json['status'] ?? 'In Stock',
      accountEmail: json['account_email'],
      accountUsername: json['account_username'],
      image: json['image'],
      accountDetails: json['accountDetails'] is Map ? json['accountDetails'] : {},
    );
  }
}

class Ticket {
  final String id;
  final String subject;
  final String message;
  final String status;
  final String userEmail;
  final String date;

  Ticket({
    required this.id,
    required this.subject,
    required this.message,
    required this.status,
    required this.userEmail,
    required this.date,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) {
    return Ticket(
      id: json['id']?.toString() ?? '',
      subject: json['subject'] ?? 'No Subject',
      message: json['message'] ?? '',
      status: json['status'] ?? 'Open',
      userEmail: json['user_email'] ?? 'System',
      date: json['created_at'] ?? '',
    );
  }
}

class AppUser {
  final String id;
  final String email;
  final String role;
  final double walletBalance;
  final bool isBanned;
  final String date;

  AppUser({
    required this.id,
    required this.email,
    required this.role,
    required this.walletBalance,
    required this.isBanned,
    required this.date,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id']?.toString() ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'buyer',
      walletBalance: double.tryParse(json['wallet_balance']?.toString() ?? '0') ?? 0.0,
      isBanned: json['is_banned'] == 1 || json['is_banned'] == true,
      date: json['created_at'] ?? '',
    );
  }
}

class Payout {
  final String id;
  final String userEmail;
  final double amount;
  final String status;
  final String method;
  final String date;

  Payout({
    required this.id,
    required this.userEmail,
    required this.amount,
    required this.status,
    required this.method,
    required this.date,
  });

  factory Payout.fromJson(Map<String, dynamic> json) {
    return Payout(
      id: json['id']?.toString() ?? '',
      userEmail: json['email'] ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      status: json['status'] ?? 'pending',
      method: json['method'] ?? 'Manual',
      date: json['created_at'] ?? '',
    );
  }
}
class Blog {
  final String id;
  final String title;
  final String? category;
  final String? excerpt;
  final String? content;
  final String? image;
  final String date;

  Blog({required this.id, required this.title, this.category, this.excerpt, this.content, this.image, required this.date});

  factory Blog.fromJson(Map<String, dynamic> json) {
    return Blog(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      category: json['category'],
      excerpt: json['excerpt'],
      content: json['content'],
      image: json['image'],
      date: json['date'] ?? json['createdAt'] ?? '',
    );
  }
}

class Staff {
  final String id;
  final String name;
  final String? username;
  final String email;
  final String position;
  final String department;
  final List<String> permissions;

  Staff({required this.id, required this.name, this.username, required this.email, required this.position, required this.department, required this.permissions});

  factory Staff.fromJson(Map<String, dynamic> json) {
    List<String> perms = [];
    if (json['permissions'] is String) {
      try {
        perms = List<String>.from(jsonDecode(json['permissions']));
      } catch (_) {}
    } else if (json['permissions'] is List) {
      perms = List<String>.from(json['permissions']);
    }

    return Staff(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      username: json['username'],
      email: json['email'] ?? '',
      position: json['position'] ?? 'Staff',
      department: json['department'] ?? 'General',
      permissions: perms,
    );
  }
}

class Lead {
  final String id;
  final String email;
  final String? phone;
  final String? source;
  final String date;

  Lead({required this.id, required this.email, this.phone, this.source, required this.date});

  factory Lead.fromJson(Map<String, dynamic> json) {
    return Lead(
      id: json['id']?.toString() ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      source: json['source'],
      date: json['created_at'] ?? '',
    );
  }
}

class Service {
  final String id;
  final String title;
  final String? desc;
  final String? icon;

  Service({required this.id, required this.title, this.desc, this.icon});

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      desc: json['desc'],
      icon: json['icon'],
    );
  }
}

class Project {
  final String id;
  final String title;
  final String? description;

  Project({required this.id, required this.title, this.description});

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'],
    );
  }
}

class Rental {
  final String id;
  final String domain;
  final String price;

  Rental({required this.id, required this.domain, required this.price});

  factory Rental.fromJson(Map<String, dynamic> json) {
    return Rental(
      id: json['id']?.toString() ?? '',
      domain: json['domain'] ?? '',
      price: json['price'] ?? '0',
    );
  }
}

class Testimonial {
  final String id;
  final String name;
  final String review;
  final int rating;

  Testimonial({required this.id, required this.name, required this.review, required this.rating});

  factory Testimonial.fromJson(Map<String, dynamic> json) {
    return Testimonial(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      review: json['review'] ?? '',
      rating: int.tryParse(json['rating']?.toString() ?? '5') ?? 5,
    );
  }
}

class Coupon {
  final String id;
  final String code;
  final String discount;
  final String? expiresAt;

  Coupon({required this.id, required this.code, required this.discount, this.expiresAt});

  factory Coupon.fromJson(Map<String, dynamic> json) {
    return Coupon(
      id: json['id']?.toString() ?? '',
      code: json['code'] ?? '',
      discount: json['discount']?.toString() ?? '0',
      expiresAt: json['expiresAt'],
    );
  }
}

class KBArticle {
  final String id;
  final String title;
  final String category;
  final String content;

  KBArticle({required this.id, required this.title, required this.category, required this.content});

  factory KBArticle.fromJson(Map<String, dynamic> json) {
    return KBArticle(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      category: json['category'] ?? 'General',
      content: json['content'] ?? '',
    );
  }
}

class Category {
  final String id;
  final String name;
  final String slug;
  final String? icon;

  Category({required this.id, required this.name, required this.slug, this.icon});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      icon: json['icon'],
    );
  }
}
