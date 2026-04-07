import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Wallet, ShoppingBag, ArrowUpRight, TicketIcon, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const { data: dashboard, isLoading } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, <span className="text-primary">{dashboard.user.name}</span></h1>
          <p className="text-muted-foreground mt-1">Manage your account and recent activities.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/my-orders">Order History</Link>
          </Button>
          <Button asChild>
            <Link href="/shop">Browse Shop</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card/50 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Wallet Balance
              <Wallet className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${dashboard.walletBalance.toFixed(2)}</div>
            <Button variant="link" className="px-0 text-primary h-auto mt-2 p-0">Add Funds <ArrowUpRight className="w-3 h-3 ml-1" /></Button>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Spent
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${dashboard.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-2">Across {dashboard.totalOrders} orders</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Referral Earnings
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">${dashboard.referralEarnings.toFixed(2)}</div>
            <Button asChild variant="link" className="px-0 text-primary h-auto mt-2 p-0">
              <Link href="/refer">Get your link <ArrowUpRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Open Tickets
              <TicketIcon className="w-4 h-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{dashboard.openTickets}</div>
            <Button asChild variant="link" className="px-0 text-primary h-auto mt-2 p-0">
              <Link href="/support">Support Center <ArrowUpRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Orders</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/my-orders">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dashboard.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                      <div>
                        <p className="font-medium text-foreground">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${order.total.toFixed(2)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-primary/20 text-primary' : 
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent orders found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{dashboard.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">{new Date(dashboard.user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membership Tier</p>
                <p className="font-medium text-primary capitalize">{dashboard.user.membershipTier || "Standard"}</p>
              </div>
              <Button variant="outline" className="w-full mt-2">Edit Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
