import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "~/lib/blog-data";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { FadeIn } from "~/components/animations/fade-in";
import { Button } from "~/components/ui/button";
import { Navbar } from "~/components/layout/navbar";
import { Footer } from "~/components/layout/footer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return { title: "Post Not Found" };

    return {
        title: `${post.title} | ClipFlow Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
        }
    };
}

export function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // JSON-LD for SEO
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": [`https://clipflow.ai/api/og?title=${post.title}`],
        "datePublished": post.date,
        "author": [{
            "@type": "Person",
            "name": "Gemini Pro",
            "url": "https://clipflow.ai/about"
        }]
    };

    return (
        <main className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground pt-32 pb-24">
            <Navbar />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="container mx-auto max-w-4xl px-6 relative">
                <FadeIn>
                    {/* Back Link */}
                    <div className="mb-12">
                        <Link href="/blog" className="inline-flex items-center text-sm font-bold hover:text-muted-foreground transition-colors">
                            <ArrowLeft className="mr-2 size-4" /> Back to Blog
                        </Link>
                    </div>

                    {/* Header */}
                    <header className="mb-12 border-b border-border pb-12">
                        <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
                            <span className="bg-muted text-foreground px-2 py-1 font-bold">{post.category}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] mb-8 tracking-tight text-balance">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`size-12 rounded-full bg-gradient-to-br ${post.coverGradient} shadow-sm`} />
                                <div>
                                    <div className="text-sm font-bold">Written by Gemini Pro</div>
                                    <div className="text-xs text-muted-foreground">AI Content Specialist</div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="flex flex-col md:flex-row gap-12">
                        {/* Stick Sidebar (ToC placeholder) */}
                        <aside className="hidden md:block w-48 shrink-0 relative">
                            <div className="sticky top-32 text-sm text-muted-foreground">
                                <p className="font-bold text-foreground mb-4 uppercase tracking-wider text-xs">In this Article</p>
                                <div className="space-y-3">
                                    <a href="#" className="block hover:text-foreground transition-colors">Introduction</a>
                                    <a href="#" className="block hover:text-foreground transition-colors">The Core Strategy</a>
                                    <a href="#" className="block hover:text-foreground transition-colors">Key Takeaways</a>
                                    <div className="h-px bg-border my-4" />
                                    <div className="text-xs font-mono uppercase">Share</div>
                                    <div className="flex gap-2 text-foreground">
                                        <Share2 className="size-4 hover:scale-110 transition-transform cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Content */}
                        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-foreground prose-a:underline hover:prose-a:text-muted-foreground prose-blockquote:border-l-4 prose-blockquote:border-foreground prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-foreground/90 prose-img:rounded-xl max-w-none flex-1">
                            <div className={`h-2 w-full bg-gradient-to-r ${post.coverGradient} mb-12 rounded-full`} />
                            <MarkdownRenderer content={post.content} />
                        </div>
                    </div>

                    {/* Author Box / CTA */}
                    <div className="mt-24 mb-32 p-12 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${post.coverGradient} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`} />

                        <div className="size-20 w-[20%] bg-primary text-primary-foreground flex items-center justify-center font-serif text-4xl italic rounded-full shadow-lg relative z-10">
                            Ai
                        </div>
                        <div className="flex-1 relative z-10">
                            <h3 className="font-bold text-2xl mb-2">Grow your channel with AI</h3>
                            <p className="text-muted-foreground text-lg mb-6">
                                This article was analyzed and synthesized by ClipFlow's engine.
                                Use the same technology to explode your content reach.
                            </p>
                            <Button asChild className="h-12 px-8 text-lg rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                                <Link href="/signup">Generate Viral Clips Free</Link>
                            </Button>
                        </div>
                    </div>
                </FadeIn>
            </article>

            <Footer />
        </main>
    );
}

// Simple Custom Markdown Renderer
function MarkdownRenderer({ content }: { content: string }) {
    const lines = content.trim().split('\n');

    return (
        <div className="space-y-8 text-foreground/90 leading-relaxed font-serif text-xl">
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <div key={i} className="h-4" />;

                if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-2xl font-bold text-foreground font-sans mt-12 mb-4 tracking-tight">{parseBold(line.slice(4))}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-3xl md:text-4xl font-bold text-foreground font-sans mt-16 mb-8 border-b-2 border-foreground pb-4">{parseBold(line.slice(3))}</h2>;
                }
                if (line.startsWith('> ')) {
                    return (
                        <blockquote key={i} className="relative pl-8 py-4 my-10 text-2xl italic text-foreground bg-muted border-l-4 border-foreground rounded-r-xl">
                            <span className="absolute top-0 left-2 text-6xl text-foreground/10 font-serif">“</span>
                            "{parseBold(line.slice(2))}"
                        </blockquote>
                    );
                }
                if (trimmed.startsWith('* ')) {
                    return (
                        <div key={i} className="flex gap-4 ml-2 mb-4 items-start">
                            <div className="mt-2.5 size-2 bg-foreground rounded-full shrink-0" />
                            <span className="text-foreground/90">{parseBold(trimmed.slice(2))}</span>
                        </div>
                    );
                }
                // Numbered list simulation
                if (/^\d\.\s/.test(trimmed)) {
                    return (
                        <div key={i} className="flex gap-4 ml-2 mb-4 items-start">
                            <span className="font-bold text-foreground min-w-[1.5rem]">{trimmed.split('.')[0]}.</span>
                            <span className="text-foreground/90">{parseBold(trimmed.replace(/^\d\.\s/, ''))}</span>
                        </div>
                    );
                }

                return <p key={i} className="mb-4">{parseBold(line)}</p>;
            })}
        </div>
    );
}

function parseBold(text: string) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}
