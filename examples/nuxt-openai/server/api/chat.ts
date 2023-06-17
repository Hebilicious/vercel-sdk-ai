// ./api/chat.ts
import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse, streamToResponse } from 'ai'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async event => {
  // Create an OpenAI API client (that's edge friendly!)
  let apiKey = useRuntimeConfig().openaiApiKey as string
  if (apiKey.length === 0) {
    apiKey = event.context.cloudflare.env.NUXT_OPENAI_API_KEY
  }
  const config = new Configuration({ apiKey })
  const openai = new OpenAIApi(config)

  // Extract the `prompt` from the body of the request
  // const { messages } = await readBody(event)
  const { messages } = await event.request.json()
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
  return new StreamingTextResponse(stream)
})
