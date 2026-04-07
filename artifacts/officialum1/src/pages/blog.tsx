import { useListBlogs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { makeSimpleBreadcrumbs } from "@/lib/seo";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Blog() {
  const { data: blogs, isLoading } = useListBlogs();

  return (
    <div className="container mx-auto py-16 px-4">
      <SEO
        title="Official Insights — Digital Marketing & Growth Blog"
        description="Expert articles on scaling businesses, mastering SEO, buying aged social media accounts, and leveraging digital assets. Fresh insights from the OfficialUM1 team."
        keywords="digital marketing blog, SEO tips, social media accounts, aged accounts guide, reddit marketing, discord growth"
        breadcrumbs={makeSimpleBreadcrumbs({ name: "Blog", href: "/blog" })}
        type="website"
      />
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Blog</p>
        <h1 className="text-4xl font-black mb-4">Official Insights</h1>
        <p className="text-xl text-muted-foreground">
          Expert analysis on scaling businesses, mastering SEO, and leveraging digital assets for maximum ROI.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] bg-card/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs?.map((post, index) => (
            <Card key={post.id} className={`bg-card/40 border-border/50 overflow-hidden flex flex-col group hover:border-primary/50 transition-colors ${index === 0 ? "md:col-span-2 lg:col-span-2" : ""}`}>
              {post.imageUrl ? (
                <div className={`overflow-hidden ${index === 0 ? "h-64 md:h-80" : "h-48"}`}>
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ) : (
                <div className={`bg-muted flex items-center justify-center ${index === 0 ? "h-64 md:h-80" : "h-48"}`}>
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
              
              <CardContent className="flex-1 p-6">
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-primary border-primary/30">{post.category}</Badge>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {post.readTime} min read
                  </div>
                </div>
                
                <Link href={`/blog/${post.slug}`}>
                  <h2 className={`font-bold hover:text-primary transition-colors mb-3 ${index === 0 ? "text-2xl md:text-3xl" : "text-xl"}`}>
                    {post.title}
                  </h2>
                </Link>
                
                <p className="text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
              </CardContent>
              
              <CardFooter className="p-6 pt-0 border-none">
                <Button variant="link" className="px-0 text-primary group-hover:text-primary" asChild>
                  <Link href={`/blog/${post.slug}`}>
                    Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
