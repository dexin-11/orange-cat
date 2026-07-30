import html from "../index.html";
// 随机模式相机外观照片：各皮肤对应不同型号（Data 模块导入为二进制）
import camClassic from "../assets/cam-classic.jpg";
import camInstax from "../assets/cam-instax.jpg";
import camCam96 from "../assets/cam-cam96.jpg";
import camNoir from "../assets/cam-noir.jpg";
import camLimoland from "../assets/cam-limoland.jpg";
import camJoycam from "../assets/cam-joycam.jpg";

// 随机模式相机照片路由表：路径 → 导入的二进制模块
var CAM_PHOTOS = {
  "/assets/cam-classic.jpg": camClassic,
  "/assets/cam-instax.jpg": camInstax,
  "/assets/cam-cam96.jpg": camCam96,
  "/assets/cam-noir.jpg": camNoir,
  "/assets/cam-limoland.jpg": camLimoland,
  "/assets/cam-joycam.jpg": camJoycam,
};

// 418 维护页 Worker —— 所有路径均返回 418 状态码 + 维护页面 HTML
// 例外：/assets/cam-*.jpg 返回随机模式相机外观照片
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

    // 静态资源：随机模式各皮肤对应的相机外观照片（长期缓存）
    var photo = CAM_PHOTOS[url.pathname];
    if (photo) {
      return new Response(photo, {
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
