import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Home } from "@/pages/home";
import { Login } from "@/pages/login";
import { Register } from "@/pages/register";
import { Dashboard } from "@/pages/dashboard";
import { Shop } from "@/pages/shop";
import { ShopDetail } from "@/pages/shop-detail";
import { Services } from "@/pages/services";
import { MyOrders, OrderDetail } from "@/pages/orders";
import { Cart } from "@/pages/cart";
import { Checkout } from "@/pages/checkout";
import { OrderSuccess } from "@/pages/order-success";
import { Blog } from "@/pages/blog";
import { BlogDetail } from "@/pages/blog-detail";
import { Reviews } from "@/pages/reviews";
import { About } from "@/pages/about";
import { Contact } from "@/pages/contact";
import { Support } from "@/pages/support";
import { Membership } from "@/pages/membership";
import { Refer } from "@/pages/refer";
import { Privacy, Terms } from "@/pages/legal";
import { Admin } from "@/pages/admin";
import { FAQ } from "@/pages/faq";
import { Work } from "@/pages/work";
import { Wishlist } from "@/pages/wishlist";
import { Bundles } from "@/pages/bundles";
import { Builder } from "@/pages/builder";
import { KnowledgeBase, KBArticle } from "@/pages/kb";
import { ShareExperience } from "@/pages/share-experience";
import { ForgotPassword } from "@/pages/forgot-password";
import { DeliveryPage } from "@/pages/delivery";
import { AppLayout } from "@/components/layout/AppLayout";
import { WishlistProvider } from "@/hooks/useWishlist";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Admin panel — no navbar/footer */}
      <Route path="/admin" component={Admin} />

      {/* Delivery page — bare, no navbar */}
      <Route path="/d/:token" component={DeliveryPage} />

      {/* Public site */}
      <Route>
        <AppLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/shop" component={Shop} />
            <Route path="/shop/:id" component={ShopDetail} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/order-success" component={OrderSuccess} />
            <Route path="/my-orders" component={MyOrders} />
            <Route path="/orders/:id" component={OrderDetail} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/services" component={Services} />
            <Route path="/about" component={About} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogDetail} />
            <Route path="/reviews" component={Reviews} />
            <Route path="/contact" component={Contact} />
            <Route path="/support" component={Support} />
            <Route path="/membership" component={Membership} />
            <Route path="/refer" component={Refer} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/faq" component={FAQ} />
            <Route path="/work" component={Work} />
            <Route path="/wishlist" component={Wishlist} />
            <Route path="/bundles" component={Bundles} />
            <Route path="/builder" component={Builder} />
            <Route path="/kb" component={KnowledgeBase} />
            <Route path="/kb/:slug" component={KBArticle} />
            <Route path="/share-experience" component={ShareExperience} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WishlistProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <div className="min-h-[100dvh] bg-background font-sans antialiased text-foreground flex flex-col">
              <Router />
            </div>
          </WouterRouter>
          <Toaster />
        </WishlistProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
