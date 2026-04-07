import { useListReviews, useGetReviewStats } from "@workspace/api-client-react";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs, makeReviewSchema } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Quote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function Reviews() {
  const { data: stats, isLoading: statsLoading } = useGetReviewStats();
  const { data: reviewsRaw, isLoading: reviewsLoading } = useListReviews();
  const reviewsData = Array.isArray(reviewsRaw) ? reviewsRaw : [];

  return (
    <div className="container mx-auto py-16 px-4 max-w-6xl">
      <SEO
        title="Customer Reviews — Verified OfficialUM1 Testimonials"
        description="See what 1700+ satisfied customers say about OfficialUM1. Verified reviews for our digital account marketplace and agency services — with real star ratings."
        keywords="officialum1 reviews, testimonials, customer feedback, social media accounts reviews, digital marketplace reviews"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Reviews", href: "/reviews" })}
        type="website"
      />
      <div className="text-center mb-12">
        <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Reviews</p>
        <h1 className="text-4xl font-black mb-4 text-foreground">What Our Clients Say</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Join 4,900+ happy clients who trusted us.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-lg">250+</span>
            <span className="text-muted-foreground">Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-lg">4.9★</span>
            <span className="text-muted-foreground">Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-lg">3.6k</span>
            <span className="text-muted-foreground">Orders</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-card/50 border border-border/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          {statsLoading ? (
            <Skeleton className="h-16 w-32 mb-4" />
          ) : (
            <>
              <div className="text-6xl font-bold text-primary mb-2">{stats?.averageRating.toFixed(1)}</div>
              <div className="flex text-primary mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-6 h-6 ${i <= (stats?.averageRating || 0) ? "fill-current" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-muted-foreground">Based on {stats?.totalReviews} reviews</p>
            </>
          )}
        </div>

        <div className="md:col-span-2 bg-card/50 border border-border/50 rounded-2xl p-8">
          {statsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : stats && (
            <div className="space-y-3">
              {[
                { label: '5 Stars', count: stats.fiveStar, color: 'bg-primary' },
                { label: '4 Stars', count: stats.fourStar, color: 'bg-primary/80' },
                { label: '3 Stars', count: stats.threeStar, color: 'bg-yellow-500' },
                { label: '2 Stars', count: stats.twoStar, color: 'bg-orange-500' },
                { label: '1 Star', count: stats.oneStar, color: 'bg-destructive' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-16 text-sm font-medium text-muted-foreground">{item.label}</span>
                  <Progress value={stats.totalReviews > 0 ? (item.count / stats.totalReviews) * 100 : 0} className="h-2 flex-1" indicatorClassName={item.color} />
                  <span className="w-8 text-right text-sm text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Grid */}
      {reviewsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviewsData.map((review: any) => (
            <Card key={review.id} className="bg-card/40 border-border/50 break-inside-avoid shadow-sm hover:shadow-primary/5 transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{review.authorName}</p>
                      {review.verified && (
                        <div className="flex items-center text-xs text-primary/80">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-muted opacity-30"}`} />
                    ))}
                  </div>
                </div>
                
                {review.productName && (
                  <Badge variant="outline" className="mb-3 text-xs bg-background/50 border-border">
                    {review.productName}
                  </Badge>
                )}
                
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/10 rotate-180" />
                  <p className="text-muted-foreground text-sm relative z-10 pl-4">
                    {review.comment}
                  </p>
                </div>
                <div className="mt-4 text-xs text-muted-foreground/50 text-right">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
