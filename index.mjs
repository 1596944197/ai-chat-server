import { ChatGPTAPI } from 'chatgpt'
import { WebSocketServer } from 'ws'
import Mysql from 'mysql'


const connection = Mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'password'
})

connection.connect((err) => {
  if (err) {
    console.error(err)
    throw Error('连接失败')
  }
  connection.query("CREATE DATABASE Test", (err, res) => {
    debugger
    if (err) throw Error('创建失败')
    console.log(res)
  })
})

const GPTApi = new ChatGPTAPI({
  apiKey: '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',
})
const ws = new WebSocketServer({
  port: 3332
})

ws.on('error', console.error);
ws.once('listening', () => console.log('ws正在监听'))

/** @returns {每个 wss 都指向一个用户} */
ws.on('connection', (wss) => {
  let currentGpt

  wss.on('message', async (data) => {
    try {
      const options = currentGpt ? {
        conversationId: currentGpt.conversationId,
        parentMessageId: currentGpt.id
      } : {}

      const response = await GPTApi.sendMessage(JSON.parse(data.toString()), options)
      currentGpt === response ? null : currentGpt = response

      wss.send(response.text)
    } catch (error) {
      console.warn(error)
      wss.send('sorry,this bot is wrong,please wait a few')
    }
  })
})
