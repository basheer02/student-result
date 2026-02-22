import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const path = searchParams.get("path");

    // e.g. /api/revalidate?tag=class-class-6
    if (tag) {
        revalidateTag(tag, {});
        return NextResponse.json({ revalidated: true, now: Date.now(), type: "tag", id: tag });
    }

    // e.g. /api/revalidate?path=/admin/class-6
    if (path) {
        revalidatePath(path);
        return NextResponse.json({ revalidated: true, now: Date.now(), type: "path", id: path });
    }

    return NextResponse.json({
        revalidated: false,
        now: Date.now(),
        message: "Missing path or tag to revalidate",
    });
}
