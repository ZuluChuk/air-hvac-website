// Cloudflare Pages Function — never expose the access token in client-side code.
const API_VERSION = "v24.0";
export async function onRequestGet({ env }) {
  const headers = {"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=900"};
  if (!env.INSTAGRAM_ACCESS_TOKEN || !env.INSTAGRAM_USER_ID)
    return new Response(JSON.stringify({posts:[],configured:false}), {headers});
  const url = new URL("https://graph.instagram.com/"+API_VERSION+"/"+encodeURIComponent(env.INSTAGRAM_USER_ID)+"/media");
  url.searchParams.set("fields","id,caption,media_type,media_url,thumbnail_url,permalink,timestamp");
  url.searchParams.set("limit","12");
  try {
    const response = await fetch(url, {headers:{Authorization:"Bearer "+env.INSTAGRAM_ACCESS_TOKEN}});
    if (!response.ok) throw new Error("Instagram API HTTP "+response.status);
    const data = await response.json();
    const posts = (data.data || []).map(p=>({
      imageUrl: p.media_type==="VIDEO" ? p.thumbnail_url : p.media_url,
      permalink:p.permalink, caption:p.caption || "AIR HVAC installation", timestamp:p.timestamp
    })).filter(p=>p.imageUrl?.startsWith("https://") && /^https:\/\/(www\.)?instagram\.com\//.test(p.permalink||"")).slice(0,4);
    return new Response(JSON.stringify({posts}), {headers});
  } catch(e) {
    console.error("Instagram feed error",e.message);
    return new Response(JSON.stringify({posts:[],unavailable:true}), {status:503,headers:{"content-type":"application/json","cache-control":"no-store"}});
  }
}
