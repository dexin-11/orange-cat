import html from "../index.html";

// 418 维护页 Worker —— 所有路径均返回 418 状态码 + 维护页面 HTML
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 健康检查端点（用于监控）
    if (url.pathname === "/__health") {
      return new Response(
        JSON.stringify({ ok: true, status: 418, reason: "maintenance" }),
        {
          status: 200,
          headers: { "content-type": "application/json;charset=UTF-8" },
        }
      );
    }

    return new Response(html, {
      status: 418,
      statusText: "I'm a teapot",
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-store, must-revalidate",
        "x-maintenance": "true",
        "x-content-type-options": "nosniff",
        "referrer-policy": "no-referrer",
      },
    });
  },
};
