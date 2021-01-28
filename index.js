let repl = require('repl')
let ioredirect = require('./ioredirect')

module.exports = (opts) => {
	let enabled = false

	let rshell

	rshell = {
		welcome:  `welcome..beep..boop..\n\n`,
        prompt:   '', 
        userpass: [],
        clients:  {}, 
        interactive: false, 
        start:    () => enabled = true, 
        stop:     () => enabled = false, 
		format: (out) => out, 
		oncmd: (i) => {
			console.log("rshell cmd: "+i.cmd)
			let error = null
			i.cb(error,"cmd = "+i.cmd )
		},
		date: () => (new Date()).toISOString()
							    .replace(/T/, ' ')
							    .replace(/\..*/, '')
							    .replace(/[0-9][0-9][0-9][0-9]-/,''),
		middleware: (req,res,next) => {
			if( !enabled                    ) return next()
			if( !rshell.allowed(req,res)    ) return next()
			if( !rshell.auth(req,res)       ) return next()
            let id = req.socket.remotePort
			console.log("rshell connection "+id+" started")

            rshell.clients[id] = {req,res,id,stdout: !rshell.interactive, stderr: !rshell.interactive }  
			res.setHeader('content-type', 'multipart/octet-stream')
			res.write( rshell.welcome )
			repl.start({
			  prompt: rshell.prompt, 
			  input: req, 
			  output: res, 
			  terminal: false, 
			  useColors: true, 
			  useGlobal: false, 
			  writer: rshell.format, 
			  eval: (cmd, context, file, cb) => rshell.oncmd({cmd, id, ctx:()=>ctx, file, cb, req:()=>req, res:()=>res})
			})

			// hack to thread stdin and stdout
			// simultaneously in curl's single thread
			var iv
            if( rshell.interactive ){
                var c = new Buffer([0])
                iv = setInterval(function () {
                  if( enabled ) res.write(c)//String.fromCharCode(0))
                }, 100)
            }
            
			res.connection.on('end', function (iv, req,res) {
              let id = req.socket.remotePort
              delete rshell.clients[id]
			  console.log("rshell connection "+id+" ended")
			  if( rshell.interactive ) clearInterval(iv)
			}.bind(this,iv,req,res))

		}, 
		close: (i) => i, 
		auth:  (req,res) => {
			var userpass = new Buffer.from((req.headers.authorization || '').split(' ')[1] || '',  'base64').toString();
			if (rshell.userpass && !rshell.userpass.includes(userpass) ) {
				res.writeHead(401,  { 'WWW-Authenticate': 'Basic realm="nope"' });
				res.end('HTTP Error 401 Unauthorized: Access is denied');
				return false
			}
			return true
		},
		allowed: (req,res) => String(req.headers['user-agent']).match(/curl\//),
		...opts,
    }
	ioredirect(rshell)
	return rshell
}
