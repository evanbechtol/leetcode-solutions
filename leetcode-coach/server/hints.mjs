import http from 'node:http'
import OpenAI from 'openai'

const port = Number(process.env.HINT_SERVER_PORT || 8787)
const model = process.env.OPENAI_HINT_MODEL || 'gpt-5-mini'
const questionTypes = ['Pattern', 'Data Structure', 'Algorithm', 'Time Complexity', 'Space Complexity']

function send(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.APP_ORIGIN || 'http://localhost:5173',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  })
  response.end(JSON.stringify(body))
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {})
  if (request.method !== 'POST' || !['/api/hint', '/api/quiz'].includes(request.url)) return send(response, 404, { error: 'Not found' })
  if (!process.env.OPENAI_API_KEY) return send(response, 503, { error: 'OPENAI_API_KEY is not configured' })

  let raw = ''
  request.on('data', (chunk) => {
    raw += chunk
    if (raw.length > 30_000) request.destroy()
  })
  request.on('end', async () => {
    try {
      const context = JSON.parse(raw)
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      if (request.url === '/api/hint') {
        const result = await client.responses.create({
          model,
          instructions: 'You are a Socratic coding interview coach. Give one concise leading hint, never reveal the correct option or full solution. Address the learner’s specific misconception. Use at most 55 words.',
          input: JSON.stringify(context),
        })
        return send(response, 200, { hint: result.output_text.trim() })
      }

      const result = await client.responses.create({
        model,
        instructions: `You design rigorous Socratic coding-interview lessons. Using the supplied problem and canonical solution, create exactly five multiple-choice decisions in this exact order: ${questionTypes.join(', ')}. Each question must have exactly four plausible options and one zero-based integer answer. Explanations must justify the correct answer. Hints must lead without revealing the answer. Return only valid JSON shaped as {"questions":[{"id":"string","type":"Pattern","prompt":"string","options":["string","string","string","string"],"answer":0,"explanation":"string","hint":"string"}]}. Do not use Markdown fences.`,
        input: JSON.stringify(context),
      })
      const jsonText = result.output_text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
      const parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed.questions) || parsed.questions.length !== 5) throw new Error('Model returned an invalid question count')
      const questions = parsed.questions.map((question, index) => {
        if (question.type !== questionTypes[index] || !Array.isArray(question.options) || question.options.length !== 4 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) {
          throw new Error(`Invalid generated question at index ${index}`)
        }
        return { ...question, id: `${context.id}-${index}-${String(question.id || question.type).toLowerCase().replace(/[^a-z0-9]+/g, '-')}` }
      })
      send(response, 200, { questions })
    } catch (error) {
      console.error(error)
      send(response, 500, { error: 'Could not generate coach response' })
    }
  })
})

server.listen(port, () => console.log(`AI coach service listening on http://localhost:${port}`))
