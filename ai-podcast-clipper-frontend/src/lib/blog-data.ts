export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    category: string;
    excerpt: string;
    coverGradient: string; // CSS gradient for placeholder
    readTime: string;
    content: string; // Markdown content
}

export const blogPosts: BlogPost[] = [
    {
        slug: "youtube-shorts-algorithm-2025",
        title: "Reverse Engineering the 2025 YouTube Shorts Algorithm",
        date: "Dec 15, 2024",
        category: "Deep Dive",
        excerpt: "We analyzed 1M+ Shorts to decode the new 'Satisfaction Signals'. It's no longer just about watch time.",
        coverGradient: "from-red-500 to-orange-600",
        readTime: "8 min read",
        content: `
## The Death of "Retention at All Costs"

In 2023, the meta was simple: **Trap the viewer.**
Loops, screaming hooks, and 0.5s cuts were the standard.

**In 2025, that strategy is dead.**
YouTube's VP of Product confirmed that the algorithm now penalizes "Artificial Retention". If a user watches your video twice but then immediately swipes away essentially "regretting" the time spent, your video gets buried.

### The New Metric: "SAT" (Satisfaction Score)
The algorithm now prioritizes three specific signals over raw Watch Time:

1.  **The "Share to Private" Ratio**
    *   **Old Meta:** Comments & Likes.
    *   **New Meta:** Shares to WhatsApp/iMessage.
    *   *Why?* A private share indicates "Identity Capital". You are sharing this because it makes *you* look smart/funny to your friend.
    *   **Action:** Stop asking for likes. Ask for the share. *"Send this to a friend who needs to hear this."*

2.  **The "Search-Through" Rate**
    *   People are using TikTok/Shorts as search engines.
    *   If your video appears in a search for "how to fix back pain" and gets clicked, it has 10x the staying power of a "Feed" video.
    *   **Action:** SEO your captions. Speak your keywords out loud. The AI transcription is indexing every word.

3.  **The "Passive vs Active" Scroll**
    *   The algorithm tracks if a user *pauses* scrolling to look at your profile or check the comments *during* the video.
    *   **Action:** The "Easter Egg" Strategy. Put a hidden detail or a controversial statement that forces a comment check *while* the video plays.

### The "Gemini" Factor: Multimodal Analysis
YouTube is now using Gemini-class models to "watch" your video. It understands:
*   **Visual Context:** It knows if you're holding a Coke can (Brand safety).
*   **Emotional Tone:** It detects if you are angry, happy, or educational.
*   **Text Integration:** It reads the text on your shirt.

**Optimization Checklist for 2025:**
*   [ ] **Filename:** \`keyword-rich-title.mp4\` (Yes, it still matters).
*   [ ] **First 3s Visual:** Must match the title *visually*. Don't say "I bought a Ferrari" while sitting in a room. Show the Ferrari.
*   [ ] **Audio Scrubbing:** Remove "umms" but *keep* breaths. The "AI Voice" sound is getting penalized for being low-effort.
    `
    },
    {
        slug: "repurposing-workflow-100x",
        title: "The 'Waterfall' Workflow: 1 Hour of Video = 30 Pieces of Content",
        date: "Dec 12, 2024",
        category: "Workflow",
        excerpt: "Stop treating every platform like a new job. Here is the operational blueprint used by $10M/year creators.",
        coverGradient: "from-blue-600 to-indigo-900",
        readTime: "12 min read",
        content: `
## The Problem: "Platform Fatigue"
Most creators fail because they try to "create for TikTok" then "create for LinkedIn". 
This is inefficient. You need to **Create for the Archive, then Distribute to the Feed.**

### Step 1: The Core Asset (The Podcast)
Everything starts with a 60-minute "High Density" conversation.
*   **Rule:** Discuss *evergreen* topics (Principles) vs *news* (Trends). Principles can be reposted in 2 years. News dies in 2 days.

### Step 2: The "Golden Minute" Extraction
We use **ClipFlow's AI** to identify the "Viral Spikes".
What makes a "Golden Minute"?
*   **The "Contrarian Truth":** A statement that challenges the status quo.
*   **The "Story Loop":** Setup -> Conflict -> Resolution (must happen in < 60s).
*   **The "High Energy" Shift:** When the speaker leans in and speeds up.

### Step 3: The "Context Reframing" (Crucial)
You cannot post the same file to LinkedIn and TikTok.
*   **LinkedIn Version:**
    *   *Format:* Square (1:1) or Vertical (4:5).
    *   *Caption:* "Bro-etry" style hook. Space out lines.
    *   *Vibe:* Professional, educational.
*   **TikTok Version:**
    *   *Format:* Full Vertical (9:16).
    *   *Edit:* Add subway surfer footage or B-roll if the visual is boring.
    *   *Caption:* Hashtags and "POV" Text overlay.

### Step 4: The Newsletter (Text)
Transcribe the episode.
Use Gemini/GPT-4 to:
1.  Extract the top 3 arguments.
2.  Rewrite them as a specific "How-To".
3.  Subject Line: The most controversial quote from the episode.

### Step 5: The Twitter Thread
Take the Newsletter.
Break every H2 into a Tweet.
Break every bullet point into a sub-tweet.
Attach the video clip to the *last* tweet to drive traffic back to YouTube.
    `
    },
    {
        slug: "alex-hormozi-300m-breakdown",
        title: "Deconstructing Alex Hormozi's $300M Content Machine",
        date: "Nov 30, 2024",
        category: "Case Study",
        excerpt: "Volume, Value, and Visuals. How Acquisition.com generates 500M views/month with effectively zero ad spend.",
        coverGradient: "from-yellow-400 to-yellow-600",
        readTime: "6 min read",
        content: `
## The "Value Equation" Hook
Every Hormozi video starts with a promise.
*   *Bad:* "Let's talk about sales."
*   *Hormozi:* "Here is the exact script I used to close $100k in 7 days."
*   **Formula:** [Specific Outcome] + [Timeframe] + [Proof].

### The "Volume" Argument
"Quality vs Quantity" is a lie.
Hormozi proves you need **Quality AND Quantity**.
*   He posts 60+ times a week.
*   **How?** He doesn't "create". He "documents". He records his meetings, his thoughts, his speeches.
*   **The "Sawdust" Method:** If he writes a book, the "cutting room floor" content becomes tweets. The tweets become shorts. The shorts become a compilation. Nothing is wasted.

### The Visual Style (The Hormozi Font)
You know it. The bold, caps-lock font that pops up word-by-word.
*   **Why it works:** It keeps the "Lizard Brain" engaged.
*   **The Science:** Reading along while listening increases retention by 40%. It's "Dual Coding Theory" in action.

### The "Goodwill" Bank
For 4 years, Alex sold *nothing*.
Every video ended with "I have nothing to sell you."
This built an insane amount of **Goodwill**.
When he finally launched "hundred Million Dollar Leads", the market didn't just buy it. They *promoted* it for him.

**Takeaway for SaaS Founders:**
Give away your "secret sauce" for free. Sell the implementation (the software).
    `
    },
    {
        slug: "future-of-ai-video-editing",
        title: "Generative B-Roll: The End of Stock Footage",
        date: "Nov 28, 2024",
        category: "Technology",
        excerpt: "With Sora and Veo, we are entering an era where 'footage' is typed, not filmed. Here is what it means for creators.",
        coverGradient: "from-purple-600 to-pink-600",
        readTime: "5 min read",
        content: `
## The Problem with Stock Footage
It's generic. It's lifeless. We've all seen the same "Businessman shaking hands" clip 1,000 times.
It kills the *vibe* of a unique creator.

### Enter: Generative Context
Imagine you are telling a story about "Running away from a bear in a neon city".
*   **Old Way:** Find a clip of a bear. Find a clip of a city. Hope they match.
*   **New Way:** Prompt: \`Cyberpunk city, neon rain, massive bear chasing camera, cinematic lighting, 4k.\`

### ClipFlow's "Context-Aware" Engine
We are building the bridge.
When our AI detects you talking about "Growth", it shouldn't just show a graph.
It should generate a *visual metaphor* that matches your brand style.
*   If your brand is "Dark/Gritty": A grimy wall street chart crashing.
*   If your brand is "Clean/Tech": A sleek 3D glass interface rising.

### The "Uncanny Valley" Risk
Audiences are getting smart. They can smell "AI Slop".
**The Solution:** Mixed Media.
*   Don't use 100% AI.
*   Use AI for *visualization* of abstract concepts.
*   Use Real Footage for *human connection*.
*   The "Hybrid Edit" is the future.
    `
    },
    {
        slug: "podcast-equipment-guide-2025",
        title: "The $500 vs $5,000 Podcast Setup",
        date: "Nov 15, 2024",
        category: "Gear",
        excerpt: "Do you really need a Shure SM7B? We tested the top gear so you don't have to.",
        coverGradient: "from-zinc-800 to-zinc-950",
        readTime: "7 min read",
        content: `
## The Law of Diminishing Returns

### Tier 1: The "Good Enough" ($200)
*   **Mic:** Samson Q2U ($70). It sounds 90% as good as the SM7B via USB.
*   **Cam:** iPhone 14/15 Pro (Rear Camera). It beats most webcams.
*   **Lighting:** Natural Window Light (Free).
*   **Software:** ClipFlow (Free Tier).

### Tier 2: The "Pro" ($1,500)
*   **Mic:** Shure SM7B ($400) + Cloudlifter ($150) + Interface ($150).
*   **Cam:** Sony ZV-E10 + Sigma 16mm ($800).
*   **Lighting:** Amaran 60x ($200) + Softbox.
*   **Software:** Riverside.fm + ClipFlow Pro.

### The Verdict
Content > Gear.
MrBeast's first videos were recorded on a potato.
Start with Tier 1. Upgrade to Tier 2 only when your *cash flow* pays for it.
    `
    },
    {
        slug: "seo-for-podcasts",
        title: "Podcast SEO: Ranking on Apple & Spotify",
        date: "Oct 30, 2024",
        category: "Growth",
        excerpt: "Audio search is broken. Here is how to hack the metadata to get discovered.",
        coverGradient: "from-green-500 to-emerald-700",
        readTime: "6 min read",
        content: `
## Keywords in Tiles? Yes.
Apple Podcasts and Spotify heavily weight the **Episode Title** and **Show Notes**.

### The "Colon" Strategy
Don't name your episode: *"Episode 45: Chatting with John"*.
Name it: *"How to Scale SaaS: PLG vs Sales-Led w/ John Doe"*.
*   **Front-load the value.**
*   **Include the entity (Guest Name).**
*   **Include the category (SaaS).**

### Transcripts are Indexing
Spotify is now auto-transcribing. If you don't *say* the keywords, you might not rank for them.
**The "Intro" Hack:**
Record a custom intro *after* the interview where you explicitly mention the topics covered using keyword-rich phrasing.
*"In this episode, we cover **B2B Marketing Strategies**, **Lead Gen**, and **Cold Email Templates**..."*
    `
    }
];
