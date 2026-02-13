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
