import html from "../index.html";
// 随机模式镜头背景：Polaroid OneStep SX-70 正面照（Data 模块导入为二进制）
import polaroidImg from "../assets/camera-front-polaroid.jpg";

// 418 维护页 Worker —— 所有路径均返回 418 状态码 + 维护页面 HTML
// 例外：/assets/* 返回静态资源（随机模式相机正面照）
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

    // 静态资源：随机模式相机正面照（长期缓存）
    if (url.pathname === "/assets/camera-front-polaroid.jpg") {
      return new Response(polaroidImg, {
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
