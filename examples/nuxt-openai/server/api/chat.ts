// ./api/chat.ts
import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream } from 'ai'
import type { H3Event } from 'h3'

let openai: OpenAIApi

export default defineEventHandler(async (event: any) => {
  if (!openai) {
    let apiKey = useRuntimeConfig().openaiApiKey as string
    const config = new Configuration({ apiKey })
    openai = new OpenAIApi(config)
  }

  // Extract the `prompt` from the body of the request
  const { messages } = await readBody(event)

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages.map((message: any) => ({
      content: message.content,
      role: message.role
    }))
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response)
  // Respond with the stream
  return sendStream(event, stream)
})

function sendStream(event: H3Event, stream: ReadableStream) {
  // Mark to prevent h3 handling response
  event._handled = true

  // Workers (unenv)
  // @ts-expect-error _data will be there.
  event.node.res._data = stream

  // Node.js
  if (event.node.res.socket) {
    stream.pipeTo(
      new WritableStream({
        write(chunk) {
          event.node.res.write(chunk)
        },
        close() {
          event.node.res.end()
        }
      })
    )
  }
}
