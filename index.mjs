import sendEmail from "./emailNotification.mjs";
import cron from "node-cron";
import dayjs from "dayjs";
import express from "express";
import axios from "axios";

const app = express();

app.get("/", async (req, res) => {
  await checkIn();
  res.send("签到接口没问题");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
// 定义签到任务
async function checkIn() {
  try {
    const res = await axios.post(
      "https://glados.network/api/user/checkin",
      {
        token: "glados.one",
      },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
          "Content-Type": "application/json",
          Cookie: process.env.COOKIES,
        },
      }
    );
    if (res.data.code === 0 || res.data.code === 1) {
      sendEmail({
        subject: "glados签到成功",
        html: `<h1>${res.data.message}</h1>`,
      });
    } else {
      sendEmail({
        subject: "glados签到失败",
        html: `<h1>${res.data.message}</h1>`,
      });
    }
  } catch (error) {
    sendEmail({
      subject: "glados签到失败",
      html: `<h1>${error.message}</h1>`,
    });
    console.log(error.message);
  }
}

// 使用node-cron设置定时任务，每天11:00执行
cron.schedule("35 11 * * *", async () => {
  console.log(
    dayjs().format("YYYY-MM-DD HH:mm:ss") + "-" + "开始执行签到任务..."
  );
  await checkIn();
});
console.log(
  dayjs().format("YYYY-MM-DD HH:mm:ss") +
    "-" +
    "定时任务已设置，将在每天美西时间11:35执行,中国时间19:35"
);

// 注意：在实际部署时，可能需要确保Node.js应用持续运行，可以考虑使用PM2等进程管理工具。
