import Link from "next/link";
import { ArrowRight, Calendar, Tag } from "lucide-react";
import { FadeIn } from "~/components/animations/fade-in";
import { Button } from "~/components/ui/button";
import { blogPosts } from "~/lib/blog-data";
import { Navbar } from "~/components/layout/navbar";
import { Footer } from "~/components/layout/footer";

export const metadata = {
    title: "ClipFlow Blog | Viral Content Strategies",
    description: "Insights on podcast growth, AI content repurposing, and viral video algorithms.",
};

export default function BlogIndex() {
    const featuredPost = blogPosts[0];
    const otherPosts = blogPosts.slice(1);
    const categories = Array.from(new Set(blogPosts.map(p => p.category)));

    if (!featuredPost) {
        return (
            <main className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground pb-24">
                <Navbar />
                <div className="container mx-auto px-6 pt-32 text-center">
                    <h1 className="text-4xl font-bold mb-4">Blog Coming Soon</h1>
                    <p className="text-gray-500">Check back later for updates.</p>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground pb-24">
            <Navbar />

            {/* Header */}
            <section className="px-6 mb-20 scroll-mt-32 pt-32" id="blog-header">
                <FadeIn>
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-16 mb-16 border-b border-border pb-16">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider mb-6">
                                    The ClipFlow Blog
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
                                    <span className="block text-muted-foreground">Master the Art of</span>
                                    Viral Repurposing.
                                </h1>
                            </div>
                            <p className="text-xl text-muted-foreground max-w-sm leading-relaxed text-balance">
                                Deep dives into algorithms, content strategy, and the future of AI editing.
                            </p>
                        </div>

                        {/* Category Filter Placeholders */}
                        <div className="flex overflow-x-auto pb-4 gap-2 mb-12 scrollbar-none">
                            <Button variant="default" className="rounded-full px-6 h-10 text-sm font-bold bg-primary text-primary-foreground">All Posts</Button>
                            {categories.map(cat => (
                                <Button key={cat} variant="outline" className="rounded-full px-6 h-10 text-sm font-bold border-border text-muted-foreground hover:text-foreground hover:border-primary whitespace-nowrap">
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* Featured Post */}
            <section className="px-6 mb-24">
                <div className="container mx-auto max-w-6xl">
                    <FadeIn>
                        <Link href={`/blog/${featuredPost.slug}`} className="group relative block grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                            <div className={`aspect-video md:aspect-auto md:h-full w-full rounded-2xl overflow-hidden relative bg-gradient-to-br ${featuredPost.coverGradient}`}>
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                            </div>
                            <div className="py-4">
                                <div className="flex items-center gap-4 text-xs font-bold mb-6 uppercase tracking-widest">
                                    <span className="text-foreground bg-muted px-2 py-1">{featuredPost.category}</span>
                                    <span className="text-muted-foreground">{featuredPost.readTime}</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight group-hover:underline decoration-4 underline-offset-4 decoration-primary/20 group-hover:decoration-primary transition-all">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex items-center text-base font-bold group-hover:translate-x-2 transition-transform duration-300">
                                    Read Full Analysis <ArrowRight className="ml-2 size-5" />
                                </div>
                            </div>
                        </Link>
                    </FadeIn>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center gap-4 mb-12">
                        <h3 className="text-2xl font-bold">Latest Articles</h3>
                        <div className="h-px bg-border flex-1" />
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {otherPosts.map((post, i) => (
                            <FadeIn key={post.slug} delay={i * 0.1}>
                                <Link href={`/blog/${post.slug}`} className="group block h-full flex flex-col">
                                    {/* Image Gradient */}
                                    <div className={`aspect-[16/10] bg-gradient-to-br ${post.coverGradient} mb-6 rounded-xl overflow-hidden relative shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:-translate-y-1`}>
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />

                                        {/* Category Label */}
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md text-black dark:text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm rounded-sm">
                                            {post.category}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-mono uppercase tracking-widest">
                                            <span>{post.date}</span>
                                            <span>•</span>
                                            <span>{post.readTime}</span>
                                        </div>

                                        <h2 className="text-xl font-bold mb-3 leading-tight group-hover:text-muted-foreground transition-colors">
                                            {post.title}
                                        </h2>

                                        <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center text-xs font-bold mt-auto uppercase tracking-wider text-foreground group-hover:underline">
                                            Read Article
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter / CTA */}
            <section className="mt-32 px-6">
                <FadeIn>
                    <div className="container mx-auto max-w-4xl bg-black text-white rounded-3xl p-12 md:p-24 text-center relative overflow-hidden">
                        {/* Abstract BG */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-50" />

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Join the top 1% of creators.</h2>
                            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">Get our weekly breakdown of viral mechanics, algorithm updates, and AI workflows.</p>
                            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                                <input type="email" placeholder="Enter your email" className="h-14 px-6 bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white flex-1 rounded-xl transition-all" />
                                <Button className="h-14 bg-white text-black hover:bg-gray-100 rounded-xl px-8 font-bold text-lg">Subscribe</Button>
                            </div>
                            <p className="mt-6 text-xs text-gray-600 uppercase tracking-widest">Join 15,000+ subscribers</p>
                        </div>
                    </div>
                </FadeIn>
            </section>

            <Footer />
        </main>
    );
}
