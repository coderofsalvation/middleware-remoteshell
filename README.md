## express remoteshell

allow developers to tail logs remotely using curl (and run cmds):

```sh
$ node test/polka.js 
[rshell] for terminal access run: $ curl -sSNT. localhost:8080 -u username:password
> Running on localhost:3000

$ curl <someurl>
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
 
const rshell = require('middleware-remoteshell')({
    port,
    welcome:  `welcome..beep..boop..\n\n`,
    prompt: 'myapp $ ', 
    userpass: (process.env.RSHELL_USERS||'').split(","),
    allowed: (req,res) => String(req.headers['user-agent']).match(/curl\//) && rshell.userpass.length, 
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

app.use( rshell.middleware )
// see test/polka.js or test/express.js for the full picture 
```
## Host it somewhere 

**Only** host this locally, or through an SSL proxy, SSH tunnel or intranet.<br>
Simple HTTP allows password sniffing (oops!) . 

```bash
$ RSHELL_USERS="admin:admin,john:doe" node app.js
listening at 8080
[rshell] for terminal access run: $ curl -sSNT. localhost:8080 -u admin:admin
```

## Meanwhile somewhere else 

```javascript
$ curl -sSNT. localhost:8080 -u admin:admin 

$ alias myapp="curl -sSNT. localhost:8080 -u admin:admin | stdbuf -i0 -o0 -e0 tr -d '\000'"

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

## Tips

* craft commands using [dashdash](https://npmjs.org/dashdash)
* create a bash-script to easily teleport into various apps:

```
#!/bin/bash
myapp(){  curl -sSNT. myapp.foo.com -u admin | stdbuf -i0 -o0 -e0 tr -d '\000'" }
appfoo(){ curl -sSNT. foo.com       -u admin | stdbuf -i0 -o0 -e0 tr -d '\000'" }

[[ ! -n "$1" ]] && { echo "apps: \n$(cat $0 | fgrep '(){' | head -n-1 | sed 's/(){.*//g' )" && exit; }

"$@"
```

## Test development

```javascript
$ npm install polka express
$ node test/express.js
$ node test/polka.js
```

## Credits 

* @TooTallNate for pointing out the curl trick
* @mk-pmb for pointing out the `stdbuf` trick
