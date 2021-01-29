const polka = require('polka');
const port = 8080
 
const rshell = require('./..')({
	port,
	welcome:  `welcome..beep..boop..\n\n`,
    prompt: 'myapp $ ', 
	userpass: ['admin:admin', 'john:doe'],  
	allowed: (req,res) => String(req.headers['user-agent']).match(/curl\//) && rshell.userpass.length, 
    // following params are supported by polka, or native http-module (not express)
    interactive: true,
    oncmd: (i) => {
        let error = null
        let cmd   = i.cmd.trim()
        if( cmd.match(/(stderr|stdout)/) ){
            rshell.clients[i.id][cmd] = !rshell.clients[i.id][cmd]
            if( cmd == 'stdout' ) return i.cb(error, 'stdout toggled')
            if( cmd == 'stderr' ) return i.cb(error, 'stderr toggled')
        }
        if( cmd == 'ls'     ) return i.cb(error, 'stdout\nstderr')
        i.cb(error, "unknown cmd: "+i.cmd)
    }
})
rshell.start()

polka()
.use(rshell.middleware)
.get('/', (req, res) => {
    console.log(`~> Hello, ${req.hello}`);
    res.end(`hello`)
})
.listen(port, err => {
    if (err) throw err;
    console.log(`> Running on localhost:${port}`);
});

setInterval( () => {
	console.error("test stderr")
	console.log("test stdout")
}, 1000)
