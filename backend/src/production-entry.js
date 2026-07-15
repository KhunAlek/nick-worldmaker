import app from "./index.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const response = await app.fetch(request, env, ctx);

    if (url.pathname !== "/health" || !response.ok) return response;

    let payload;
    try {
      payload = await response.clone().json();
    } catch {
      return response;
    }

    return new Response(JSON.stringify({
      ...payload,
      source_version: env.SOURCE_VERSION || "unknown",
      evaluator_version: env.EVALUATOR_VERSION || "unknown"
    }), {
      status: response.status,
      headers: response.headers
    });
  }
};
