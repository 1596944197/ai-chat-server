import { ChatGPTAPI } from "chatgpt";
import Mysql from "mysql";
import { WebSocketServer } from "ws";
import MysqlQuery from "./utils/MysqlPromise.mjs";

const connection = Mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "password",
});

connection.connect(async (err) => {
  if (err) {
    console.error(err);
    throw Error("连接失败");
  }
  const query = MysqlQuery(connection);

  let res = await query("CREATE DATABASE IF NOT EXISTS Test");

  res = await query('use Test')
  debugger
  res = await query(`CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  debugger;
});

() => {
  const GPTApi = new ChatGPTAPI({
    apiKey: "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",
  });
  const ws = new WebSocketServer({
    port: 3332,
  });

  ws.on("error", console.error);
  ws.once("listening", () => console.log("ws正在监听"));

  /** @returns {每个 wss 都指向一个用户} */
  ws.on("connection", (wss) => {
    let currentGpt;

    wss.on("message", async (data) => {
      try {
        const options = currentGpt
          ? {
            conversationId: currentGpt.conversationId,
            parentMessageId: currentGpt.id,
          }
          : {};

        const response = await GPTApi.sendMessage(
          JSON.parse(data.toString()),
          options
        );
        currentGpt === response ? null : (currentGpt = response);

        wss.send(response.text);
      } catch (error) {
        console.warn(error);
        wss.send("sorry,this bot is wrong,please wait a few");
      }
    });
  });
};
