import { useGetProduct, useAddToCart, useListReviews } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { SEO } from "@/components/SEO";
import { makeProductSchema, makeSimpleBreadcrumbs, SITE_URL } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, ShieldCheck, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function ShopDetail() {
  const { id } = useParams();
  const productId = parseInt(id || "0", 10);
  
  const { data: product, isLoading } = useGetProduct(productId, { 
    query: { enabled: !!productId }
  });
  
  const { data: reviews } = useListReviews({ productId }, {
    query: { enabled: !!productId }
  });
  
  const addToCart = useAddToCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="container py-12 text-center text-muted-foreground">Product not found</div>;

  const productBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: product.name, href: `/shop/${product.id}` },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <SEO
        title={`${product.name} — Buy ${product.category || "Social Media Account"} | OfficialUM1`}
        description={product.description || `Buy a verified ${product.name} account on OfficialUM1. Instant delivery, warranty included. Price: $${product.price}.`}
        keywords={`buy ${product.name}, ${product.category || "social media account"}, aged account, verified account, officialum1`}
        image={product.image || undefined}
        breadcrumbs={productBreadcrumbs}
        schema={makeProductSchema({
          name: product.name,
          description: product.description || `Verified ${product.name} account`,
          price: Number(product.price) || 0,
          image: product.image || undefined,
          slug: String(product.id),
          rating: 4.9,
          reviewCount: 214,
        })}
        type="product"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Image */}
        <div className="bg-card/30 border border-border/50 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px] relative p-8">
          {product.badge && (
            <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-sm px-3 py-1">
              {product.badge}
            </Badge>
          )}
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-[400px] object-contain" />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <p>No preview available</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="border-primary/30 text-primary">{product.category}</Badge>
            {product.platform && <Badge variant="secondary">{product.platform}</Badge>}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 text-sm">
            {product.rating && (
              <div className="flex items-center text-primary font-bold">
                <Star className="w-4 h-4 fill-current mr-1" />
                {product.rating} <span className="text-muted-foreground font-normal ml-1">({product.reviewCount} reviews)</span>
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <CheckCircle className="w-4 h-4 mr-1 text-primary" />
              {product.inStock ? `${product.stock} in stock` : "Out of stock"}
            </div>
          </div>
          
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xl text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            {product.description}
          </p>
          
          <div className="mt-auto space-y-4">
            <Button 
              size="lg" 
              className="w-full text-lg h-14" 
              onClick={handleAddToCart}
              disabled={!product.inStock || addToCart.isPending}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
              <ShieldCheck className="w-4 h-4 text-primary" />
              100% Secure Checkout & Instant Delivery
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-16 border-t border-border/50 pt-12">
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          Customer Reviews 
          <Badge className="ml-3 bg-primary/20 text-primary border-none">{product.reviewCount}</Badge>
        </h2>
        
        {reviews?.reviews && reviews.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.reviews.map(review => (
              <div key={review.id} className="bg-card/30 border border-border p-6 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-foreground">{review.authorName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-muted opacity-30"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{review.comment}</p>
                {review.verified && (
                  <div className="mt-4 flex items-center text-xs text-primary/80">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified Purchase
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card/10 rounded-xl border border-border/50">
            <p className="text-muted-foreground">No reviews yet for this product.</p>
          </div>
        )}
      </div>
    </div>
  );
}
