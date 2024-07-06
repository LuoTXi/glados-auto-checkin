//1. 导入nodemailer
import nodemailer from "nodemailer";
import "dotenv/config";
//2. 创建运输对象
let transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  secure: true,
  auth: {
    user: process.env.EMAIL_FROM, //输入你开启SMTP服务的QQ邮箱
    pass: process.env.EMAIL_KEY, //输入我们刚才获得的那串字符
  },
});

//3.配置发送邮件的信息
let mailOptions = {
  from: process.env.EMAIL_FROM, // 发送者,也就是你的QQ邮箱
  to: process.env.EMAIL_TO, // 接受者邮箱,可以同时发送多个,以逗号隔开
  subject: "测试发送邮件", // 邮件标题
  html: `
        <p>glados签到</p>
    `, //邮件内容，以html的形式输入，在邮件中会自动解析显示
};

export default (config = {}) => {
  //4.发送邮件
  transporter.sendMail({ ...mailOptions, ...config }, function (err, data) {
    if (err) {
      console.error("发送邮件失败", err);
    } else {
      console.info("发送成功");
    }
  });
};
