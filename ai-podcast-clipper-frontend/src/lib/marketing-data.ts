export interface Review {
    name: string;
    role: string;
    avatar: string;
    content: string;
    stars: number;
}

export const reviews: Review[] = [
    {
        name: "Alex Hormozi",
        role: "Entrepreneur & Investor",
        avatar: "AH",
        content: "It used to take me 2 days to clip my show. Now I do it in my lunch break. The ROI is undeniable.",
        stars: 5,
    },
    {
        name: "Marques Brownlee",
        role: "MKBHD",
        avatar: "MB",
        content: "The B-roll engine is insane. It finds relevant footage that matches my words exactly. Huge time saver.",
        stars: 5,
    },
    {
        name: "Codie Sanchez",
        role: "Contrarian Thinking",
        avatar: "CS",
        content: "Finally, an AI clipper that actually respects my brand fonts and colors. My team loves this.",
        stars: 5,
    },
    {
        name: "Ali Abdaal",
        role: "Productivity Expert",
        avatar: "AA",
        content: "The 'Viral Score' is scary accurate. The clips it flagged actually performed 3x better than my manual picks.",
        stars: 5,
    },
    {
        name: "Lenny Rachitsky",
        role: "Lenny's Newsletter",
        avatar: "LR",
        content: "The blog post generation is top tier. It doesn't just transcribe; it restructures the content for SEO.",
        stars: 5,
    },
    {
        name: "Sahil Bloom",
        role: "Creator",
        avatar: "SB",
        content: "ClipFlow changed my entire workflow. I can pump out 10x the content without hiring more editors.",
        stars: 5,
    },
    {
        name: "Tim Ferriss",
        role: "Author",
        avatar: "TF",
        content: "Cleanest audio removal I've heard. Studio quality from a zoom recording.",
        stars: 5,
    }
];
