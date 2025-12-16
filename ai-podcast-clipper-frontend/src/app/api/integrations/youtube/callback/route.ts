
import { NextResponse } from "next/server";
import { getGoogleOAuthClient } from "~/lib/integrations/youtube";
import { db } from "~/server/db";
import { google } from "googleapis";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // This is the userId

    if (!code || !state) {
        return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    try {
        const oauth2Client = getGoogleOAuthClient();
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get User Info (Channel Name)
        const youtube = google.youtube({ version: "v3", auth: oauth2Client });
        const response = await youtube.channels.list({
            part: ["snippet"],
            mine: true,
        });

        const channel = response.data.items?.[0];
        const channelId = channel?.id;
        const channelTitle = channel?.snippet?.title;

        if (!channelId) {
            return NextResponse.json({ error: "No YouTube Channel found" }, { status: 400 });
        }

        // Save to Database
        await db.socialProfile.upsert({
            where: {
                userId_platform: {
                    userId: state,
                    platform: "youtube",
                },
            },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token, // Only returned on first consent!
                expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
                isConnected: true,
                handle: channelTitle,
                platformUserId: channelId,
            },
            create: {
                userId: state,
                platform: "youtube",
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(tokens.expiry_date || Date.now() + 3600 * 1000),
                handle: channelTitle,
                platformUserId: channelId,
            },
        });

        // Redirect back to dashboard
        return NextResponse.redirect(`${process.env.BASE_URL}/dashboard/settings?success=youtube`);

    } catch (error) {
        console.error("YouTube Callback Error:", error);
        return NextResponse.json({ error: "Failed to connect YouTube" }, { status: 500 });
    }
}
