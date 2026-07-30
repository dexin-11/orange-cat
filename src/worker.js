import html from "../index.html";
// 随机模式镜头背景：镜头玻璃特写（Data 模块导入为二进制）
import lensGlassImg from "../assets/lens-glass.jpg";

// 418 维护页 Worker —— 所有路径均返回 418 状态码 + 维护页面 HTML
// 例外：/assets/* 返回静态资源（随机模式镜头玻璃照）
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

    // 静态资源：随机模式镜头玻璃特写（长期缓存）
    if (url.pathname === "/assets/lens-glass.jpg") {
      return new Response(lensGlassImg, {
        status: 200,
        headers: {
          "content-type": "image/jpeg",
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
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
