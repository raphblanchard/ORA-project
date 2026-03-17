export const config = { runtime: "edge" };

const GITHUB_VIDEO_URL =
    "https://github.com/raphblanchard/ORA-WIP/releases/download/v1.0-media/Test.VR.4K.mp4";

export default async function handler(req: Request) {
    // Preflight CORS
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": "Range",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    // Transmettre le header Range pour le streaming progressif (seek vidéo)
    const upstreamHeaders: HeadersInit = {};
    const range = req.headers.get("range");
    if (range) upstreamHeaders["Range"] = range;

    const upstream = await fetch(GITHUB_VIDEO_URL, { headers: upstreamHeaders });

    const responseHeaders = new Headers();

    // Propager les headers utiles
    for (const key of [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
        "last-modified",
        "etag",
    ]) {
        const val = upstream.headers.get(key);
        if (val) responseHeaders.set(key, val);
    }

    // Headers CORS pour autoriser WebGL à utiliser la vidéo comme texture
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set(
        "Access-Control-Expose-Headers",
        "Content-Length, Content-Range, Accept-Ranges"
    );

    return new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
    });
}
