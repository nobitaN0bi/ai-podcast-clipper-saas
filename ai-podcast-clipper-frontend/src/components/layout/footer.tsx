import Link from "next/link";
import { Scissors, Twitter, Linkedin, Share2 } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-20 px-6 border-t border-black/5 bg-gray-50 text-sm">
            <div className="container mx-auto max-w-6xl">
                <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="size-8 bg-black flex items-center justify-center text-white">
                                <Scissors className="size-4" />
                            </div>
                            <span className="font-bold text-lg">ClipFlow</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed mb-6">
                            The AI-powered content engine for modern creators.
                            Turn long videos into viral assets in minutes.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-gray-400 hover:text-black transition-colors"><Twitter className="size-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-black transition-colors"><Linkedin className="size-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-black transition-colors"><Share2 className="size-5" /></a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link></li>
                            <li><Link href="/marketplace" className="hover:text-black transition-colors">Marketplace</Link></li>
                            <li><Link href="/login" className="hover:text-black transition-colors">Log in</Link></li>
                            <li><Link href="/signup" className="hover:text-black transition-colors">Sign up</Link></li>
                        </ul>
                    </div>

                    {/* Free Tools (SEO Goldmine) */}
                    <div>
                        <h4 className="font-bold mb-6">Free Tools</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="/tools/youtube-transcript" className="hover:text-black transition-colors">YouTube Transcript Generator</Link></li>
                            <li><Link href="/tools/b-roll-generator" className="hover:text-black transition-colors">AI B-Roll Finder</Link></li>
                            <li><Link href="/tools/video-downloader" className="hover:text-black transition-colors">YouTube Video Downloader</Link></li>
                            <li><Link href="#" className="hover:text-black transition-colors">TikTok Caption Generator</Link></li>
                        </ul>
                    </div>

                    {/* Legal/Company */}
                    <div>
                        <h4 className="font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="/blog" className="hover:text-black transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-black transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-black transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs">
                    <p>© 2025 ClipFlow Inc. All rights reserved.</p>
                    <p>Made with 🖤 by Builders.</p>
                </div>
            </div>
        </footer>
    );
}
