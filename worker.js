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
    if (url.pathname === "/api/service-isochrone") {
      if (request.method !== "GET") return new Response("Method not allowed", {status:405});
      if (!env.OPENROUTESERVICE_API_KEY) {
        return Response.json({error:"routing_not_configured",message:"Cloudflare secret OPENROUTESERVICE_API_KEY is missing from this deployment."}, {status:503,headers:{"cache-control":"no-store"}});
      }
      const cache = caches.default;
      const cacheKey = new Request(url.origin + "/api/service-isochrone");
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
      try {
        // Resolve only the business origin postcode; never geolocate site visitors.
        const postcodeResponse = await fetch("https://api.postcodes.io/postcodes/TW166PQ");
        if (!postcodeResponse.ok) throw new Error("Postcode lookup failed");
        const postcode = await postcodeResponse.json();
        const {latitude, longitude} = postcode.result || {};
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Invalid postcode coordinates");
        const response = await fetch("https://api.heigit.org/openrouteservice/v2/isochrones/driving-car", {
          method:"POST",
          headers:{"Authorization":env.OPENROUTESERVICE_API_KEY,"Content-Type":"application/json","Accept":"application/geo+json"},
          body:JSON.stringify({locations:[[longitude,latitude]],range:[3600],range_type:"time"})
        });
        if (!response.ok) {
          const status = response.status;
          const detail = status === 401 || status === 403 ? "API key rejected or isochrones permission/quota unavailable" : status === 429 ? "Routing API rate limit reached" : status === 400 ? "Routing API rejected the isochrone request" : "Routing provider returned HTTP " + status;
          console.error("HeiGIT isochrone response", status, (await response.text()).slice(0,500));
          return Response.json({error:"routing_provider_error",provider_status:status,message:detail},{status:502,headers:{"cache-control":"no-store"}});
        }
        const geojson = await response.json();
        if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features) || !geojson.features.length) throw new Error("No isochrone geometry");
        const result = Response.json({origin:{latitude,longitude,postcode:"TW16 6PQ"},geojson}, {headers:{"cache-control":"public, max-age=604800"}});
        await cache.put(cacheKey, result.clone());
        return result;
      } catch(error) {
        console.error("Service isochrone error",error.message);
        return Response.json({error:"routing_unavailable",message:"Postcode lookup, routing request, or response processing failed. Check Cloudflare Worker logs."}, {status:503,headers:{"cache-control":"no-store"}});
      }
    }
    return env.ASSETS.fetch(request);
  }
};
