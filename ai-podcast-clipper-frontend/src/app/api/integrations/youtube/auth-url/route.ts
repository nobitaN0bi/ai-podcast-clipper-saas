
import { NextResponse } from "next/server";
import { getGoogleOAuthClient, SCOPES } from "~/lib/integrations/youtube";
import { auth } from "~/server/auth";

export async function GET() {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const oauth2Client = getGoogleOAuthClient();

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline", // Required for refresh_token
            scope: SCOPES,
            include_granted_scopes: true,
            state: session.user.id, // Pass user ID to link callback
            prompt: "consent", // Force consent to ensure we get a refresh token
        });

        return NextResponse.json({ url: authUrl });
    } catch (error) {
        console.error("Failed to generate Google Auth URL:", error);
        return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }
}
