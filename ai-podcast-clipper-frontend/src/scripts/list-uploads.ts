

import { db } from "../server/db";

async function main() {
    const files = await db.uploadedFile.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: true }
    });
    console.log("Recent Files:");
    files.forEach(f => {
        console.log(`[${f.status}] ID: ${f.id} | Key: ${f.s3Key} | User: ${f.user.email}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => { await db.$disconnect(); });
