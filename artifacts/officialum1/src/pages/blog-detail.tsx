import { useGetBlog } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { SEO } from "@/components/SEO";
import { makeBlogSchema, makeSimpleBreadcrumbs, SITE_URL } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function BlogDetail() {
  const { slug } = useParams();
  const { data: blog, isLoading } = useGetBlog(slug || "", {
    query: { enabled: !!slug }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-6 w-64 mb-8" />
        <Skeleton className="h-96 w-full rounded-2xl mb-12" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist.</p>
        <Link href="/blog" className="text-primary hover:underline">Return to Blog</Link>
      </div>
    );
  }

  const blogBreadcrumbs = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: blog.title, href: `/blog/${blog.slug}` },
  ];

  return (
    <article className="container mx-auto py-12 px-4 max-w-4xl">
      <SEO
        title={`${blog.title} | OfficialUM1 Blog`}
        description={blog.excerpt || blog.content?.substring(0, 160) || `Read: ${blog.title}`}
        keywords={blog.tags?.join(", ") || `${blog.category || "digital marketing"}, officialum1 blog`}
        image={blog.image || undefined}
        breadcrumbs={blogBreadcrumbs}
        schema={makeBlogSchema({
          title: blog.title,
          description: blog.excerpt || blog.content?.substring(0, 160) || "",
          slug: blog.slug,
          image: blog.image || undefined,
          publishedAt: blog.createdAt || blog.created_at || new Date().toISOString(),
          updatedAt: blog.updatedAt || blog.updated_at || new Date().toISOString(),
          author: blog.author || "OfficialUM1 Team",
        })}
        type="article"
      />
      <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to all articles
      </Link>

      <header className="mb-12">
        <Badge variant="outline" className="text-primary border-primary/30 mb-6">{blog.category}</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-foreground">{blog.title}</h1>
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border/50 py-4">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span className="font-medium text-foreground">{blog.author}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            {blog.readTime} min read
          </div>
        </div>
      </header>

      {blog.imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-12 border border-border/50">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto object-cover max-h-[500px]" />
        </div>
      )}

      <div className="prose prose-invert prose-primary max-w-none prose-lg">
        <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-medium">
          {blog.excerpt}
        </p>
        {/* Render markdown/html content. In a real app, use a markdown parser. Here we just render text. */}
        <div dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }} />
      </div>
    </article>
  );
}
