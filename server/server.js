const path = require('path')
const jsonServer = require('json-server')
const auth = require('json-server-auth')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))

server.db = router.db

server.use(jsonServer.defaults())
server.use(jsonServer.bodyParser)
server.use(auth)
server.use(router)

const PORT = 3001
server.listen(PORT, () => {
    console.log(`Store API listening on http://localhost:${PORT}`)
})
