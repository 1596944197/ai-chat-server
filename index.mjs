import { ChatGPTAPI } from 'chatgpt'
import exp from 'express'
import { WebSocketServer } from 'ws'

const app = exp()
const port = 3333


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
