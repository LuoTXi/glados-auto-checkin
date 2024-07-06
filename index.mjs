import puppeteer from "puppeteer";
import fs from "fs/promises";
import sendEmail from "./emailNotification.mjs";
import cron from "node-cron";
import dayjs from "dayjs";
import express from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.get("/", async (req, res) => {
  await checkIn();
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
// 定义签到任务
async function checkIn() {
  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--enable-gpu"],
    cacheDirectory: join(__dirname, ".cache", "puppeteer"),
  });
  try {
    const page = await browser.newPage();
    const cookies = process.env.COOKIES;
    console.log(cookies);
    for (const cookie of JSON.parse(cookies)) {
      await page.setCookie(cookie);
    }
    await page.goto("https://glados.network/console/checkin", {
      waitUntil: "networkidle0",
    });

    const res = await page
      .evaluate(async () => {
        const buttons = document.querySelectorAll("button");
        const aLink = document.querySelectorAll("a");
        for (let button of buttons) {
          if (
            button.textContent.trim() === "签到" ||
            button.textContent.trim() === "Checkin"
          ) {
            button.click();
            return "success";
          }
        }
        for (let a of aLink) {
          if (a.textContent.trim() === "Login") {
            return "fail:not login";
          }
        }
      })
      .catch((err) => {
        console.error(err.message);
      });

    if (res === "success") {
      console.log("签到成功");
      sendEmail({ subject: "glados签到成功", html: "<h1>签到成功</h1>" });
    } else {
      console.error("登录过期");
      sendEmail({ subject: "glados签到失败", html: "<h1>重新登录</h1>" });
    }
  } catch (error) {
    console.error("发生错误:", error.message);
  } finally {
    await browser.close();
  }
}

// 使用node-cron设置定时任务，每天11:00执行
cron.schedule("10 10 * * *", async () => {
  console.log(
    dayjs().format("YYYY-MM-DD HH:mm:ss") + "-" + "开始执行签到任务..."
  );
  await checkIn();
});

console.log(
  dayjs().format("YYYY-MM-DD HH:mm:ss") +
    "-" +
    "定时任务已设置，将在每天美西时间10:10执行"
);

// 注意：在实际部署时，可能需要确保Node.js应用持续运行，可以考虑使用PM2等进程管理工具。
