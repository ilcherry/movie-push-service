import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { join } from "node:path";
import nodemailer from "nodemailer";
import ejs from "ejs";

const dirname = import.meta.dirname;

const URL = "https://movie.douban.com/coming";

async function bootstrap() {
  let browser = null;

  try {
    // 启动 Puppeteer 并设置为无头模式
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], //禁用沙箱模式
    });
    // 打开新页面
    const page = await browser.newPage();
    // 导航到目标网页
    await page.goto(URL);
    // 获取页面内容
    const pageContent = await page.content();

    // 在此处添加提取数据的逻辑，例如使用 Cheerio 解析页面内容
    const $ = cheerio.load(pageContent);
    extractData($).then((res) => {
      emailPush(res);
    });
  } catch (error) {
    console.error("出现异常:", error);
  } finally {
    // 关闭浏览器
    if (browser) {
      await browser.close();
    }
  }
}

function extractData($) {
  return new Promise((resolve, reject) => {
    try {
      // 获取 thead 中的列名
      const headers = [];
      $("thead tr th").each((_, element) => {
        headers.push($(element).text().trim());
      });

      // 获取 tbody 中的每一行数据
      const rows = [];
      $("tbody tr").each((_, row) => {
        const rowData = {};
        $(row)
          .find("td")
          .each((cellIndex, cell) => {
            rowData[headers[cellIndex]] = $(cell).text().trim();
          });
        rows.push(rowData);
      });

      resolve({ headers, rows });
    } catch (error) {
      reject(error);
    }
  });
}

// async function writeDataToFile(data) {
//   try {
//     await fs.access(resolve("movies"), fs.constants.F_OK);
//   } catch (err) {
//     await fs.mkdir(resolve("movies"), { recursive: true });
//   }

//   try {
//     await fs.writeFile(
//       resolve("movies/movies.json"),
//       JSON.stringify(data, null, 2),
//       "utf8"
//     );
//   } catch (err) {
//     console.error("写入文件失败", err);
//   }
// }

async function emailPush(data) {
  const user = "15623412869@163.com";

  // 创建邮件传输器
  const transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    port: 587,
    secure: true,
    auth: {
      user,
      pass: "ADTpdciY5QzwS6nq",
    },
  });

  // 编辑邮件内容

  // 渲染 EJS 模板
  const templatePath = join(dirname, "email-template.ejs");
  const subject = getSubject();

  const templateData = {
    movies: data.rows,
  };

  const htmlContent = await ejs.renderFile(templatePath, templateData);

  // 推送邮件
  const info = await transporter.sendMail({
    from: user, // sender address
    to: "1062217965@qq.com", // list of receivers
    subject, // Subject line
    // text: "Hello world?", // plain text body
    html: htmlContent, // html body
  });

  console.log("Message sent: %s", info.messageId);
}

function getSubject() {
  const years = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  return `${years}年${month}月${day}日即将上映电影`;
}

bootstrap();
