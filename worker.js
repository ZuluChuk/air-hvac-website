// AIR HVAC Cloudflare Worker: serve static site and a secure Instagram feed.
const API_VERSION = "v25.0";
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/instagram") {
      if (request.method !== "GET") return new Response("Method not allowed", {status:405});
      if (!env.INSTAGRAM_ACCESS_TOKEN || !env.INSTAGRAM_USER_ID) {
        return Response.json({posts:[],configured:false,reason:"missing_instagram_configuration"}, {headers:{"cache-control":"no-store"}});
      }
      try {
        const endpoint = new URL("https://graph.instagram.com/" + API_VERSION + "/" + encodeURIComponent(env.INSTAGRAM_USER_ID) + "/media");
        endpoint.searchParams.set("fields", "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
        endpoint.searchParams.set("limit", "12");
        const result = await fetch(endpoint, {headers: {Authorization: "Bearer " + env.INSTAGRAM_ACCESS_TOKEN}});
        if (!result.ok) throw new Error("Instagram API returned " + result.status);
        const payload = await result.json();
        const posts = (payload.data || []).map(post => ({
          imageUrl: post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url,
          permalink: post.permalink,
          caption: post.caption || "AIR HVAC project",
          timestamp: post.timestamp
        })).filter(post => /^https:\/\//.test(post.imageUrl || "") && /^https:\/\/(www\.)?instagram\.com\//.test(post.permalink || "")).slice(0, 4);
        return Response.json({posts}, {headers:{"cache-control":"public, max-age=900"}});
      } catch (error) {
        console.error("Instagram feed error", error.message);
        return Response.json({posts:[],unavailable:true,reason:"instagram_api_error"}, {status:503,headers:{"cache-control":"no-store"}});
      }
    }
    return env.ASSETS.fetch(request);
  }
};
