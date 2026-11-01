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
        return Response.json({error:"routing_not_configured"}, {status:503,headers:{"cache-control":"no-store"}});
      }
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
        if (!response.ok) throw new Error("Routing service returned " + response.status);
        const geojson = await response.json();
        if (geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features) || !geojson.features.length) throw new Error("No isochrone geometry");
        return Response.json({origin:{latitude,longitude,postcode:"TW16 6PQ"},geojson}, {headers:{"cache-control":"public, max-age=86400"}});
      } catch(error) {
        console.error("Service isochrone error",error.message);
        return Response.json({error:"routing_unavailable"}, {status:503,headers:{"cache-control":"no-store"}});
      }
    }
    return env.ASSETS.fetch(request);
  }
};
