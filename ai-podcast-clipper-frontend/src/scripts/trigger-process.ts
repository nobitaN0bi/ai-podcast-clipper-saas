
import { inngest } from "../inngest/client";
import { db } from "../server/db";

async function main() {
    const fileId = "cmizukxv30001cwc4yq8kyr9n"; // Hardcoded from user output
    console.log(`Triggering processing for file: ${fileId}`);

    const file = await db.uploadedFile.findUnique({ where: { id: fileId } });
    if (!file) {
        console.error("File not found!");
        return;
    }

    await inngest.send({
        name: "process-video-events",
        data: { uploadedFileId: file.id, userId: file.userId },
    });

    console.log("✅ Event sent to Inngest! Check localhost:8288");
}

main()
    .catch(console.error)
    .finally(() => process.exit(0));
