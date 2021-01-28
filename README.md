## express remoteshell

allow developers to tail logs remotely using curl (and run cmds):

```sh
$ USERS="username:password,john:doe" node test/polka.js 
[rshell] for terminal access run: $ curl -sSNT. localhost:8080 -u username:password
> Running on localhost:3000

$ curl -sSNT. localhost:8080 -u username:password
welcome..beep..boop

myapp $ ls
stdout
stderr
myapp $ stdout
23-01 13:10:12 log: hello world from console.log
```

## Usage

app.js:

```javascript
const polka = require('polka');
const port = 8080
 
const rshell = require('./..')({
    port,
    welcome:  `welcome..beep..boop..\n\n`,
    prompt: 'myapp $ ', 
    userpass: (process.env.USERS||'').split(","),
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
    console.log(`> Running on localhost:3000`);
});

setInterval( () => console.error("test"), 1000)
```

for express, see test/express.js (it needs `curl -sSNT. localhost:8080 -u user:pass | stdbuf -i0 -o0 -e0 tr -d '\000'`)

> Now **only** host this locally, or through an SSL proxy, SSH tunnel or intranet.
> Simple HTTP let's anybody see the username/password (oops!). 

```bash
$ RSHELL_USERS="admin:admin,john:doe" node app.js
listening at 8080
[rshell] for terminal access run: $ curl -sSNT. localhost:8080 -u username:password 
```

# Meanwhile somewhere else 

```javascript
$ curl -sSNT. localhost:8080 -u admin:admin 
welcome..beep..boop..

01-28 15:45:45 log: test
01-28 15:45:45 err: this is an example error
01-28 15:45:46 log: test
01-28 15:45:46 err: this is an example error
01-28 15:45:47 log: test
01-28 15:45:47 err: this is an example error

```

```javascript
$ curl -sSNT. localhost:8080 -u admin:admin | grep err:
01-28 15:45:45 err: this is an example error
01-28 15:45:46 err: this is an example error
01-28 15:45:47 err: this is an example error

```

## Test development

```javascript
$ npm install polka express
$ node test/express.js
$ node test/polka.js
```
