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
    const options = currentGpt ? {
      conversationId: currentGpt.conversationId,
      parentMessageId: currentGpt.id
    } : {}

    const response = await GPTApi.sendMessage(data.toString(), options)
    currentGpt === response ? null : currentGpt = response

    wss.send(response.text)
  })
})
