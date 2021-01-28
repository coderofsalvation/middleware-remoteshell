const express = require('express')
const app = express()
const port = 8080

const rshell = require('./..')({
	port,
	welcome:  `welcome..beep..boop..\n\n`,
	userpass: ['admin:admin', 'john:doe'],  
	allowed: (req,res) => String(req.headers['user-agent']).match(/curl\//) && rshell.userpass.length
})

setInterval( () => {
	console.log("test")
	console.error("this is an example error")
},1000)

app.use( rshell.middleware )
rshell.start()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

