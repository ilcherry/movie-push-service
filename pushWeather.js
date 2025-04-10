/**
 *
 * 1. 获取天气的数据
 *
 * 2. 推送天气数据到邮箱
 *
 */
import nodemailer from "nodemailer";

const StatusMapping = {
  Sunny: "晴天",
  Cloudy: "多云",
  "Heavy Rain": "大雨",
  "Moderate Rain": "中雨",
  Sunny: "晴天",
};

async function getWeather() {
  try {
    const res = await fetch(
      "https://mh6fr67wbe.re.qweatherapi.com/v7/weather/3d?location=101200105&lang=en",
      {
        method: "GET",
        headers: {
          "X-QW-Api-Key": "f323711ecd16407481aa9edf7c1099c5",
        },
      }
    ).then((res) => res.json());

    return res;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {};
  }
}

const weatherResponse = await getWeather();

if (weatherResponse.code === "200") {
  const result = weatherResponse?.daily?.map((item) => {
    return {
      fxDate: item.fxDate,
      textDay: item.textDay,
      textNight: item.textNight,
    };
  });

  emailPush(result);
}

async function emailPush(data) {
  const user = "15623412869@163.com";

  const transporter = nodemailer.createTransport({
    host: "smtp.163.com",
    port: 587,
    secure: true,
    auth: {
      user,
      pass: "ADTpdciY5QzwS6nq",
    },
  });

  const subject = "未来三天的天气预报";

  const htmlContent = `
  <h2>未来三天的天气预报</h2>
  <ul>
    ${data
      ?.map(
        (item) =>
          `<li>${item.fxDate}：白天：${StatusMapping[item.textDay]} 晚上：${StatusMapping[item.textNight]}</li>`
      )
      .join("")}
  </ul>
`;

  const info = await transporter.sendMail({
    from: user,
    to: "1062217965@qq.com",
    subject,
    html: htmlContent,
  });

  console.log("Message sent: %s", info.messageId);
}
