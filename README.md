## express remoteshell

allow developers to tail logs remotely using curl

* **upcoming release**: remote shell

## Usage

app.js:

```
    const express = require('express')
    const app = express()
    const port = 8080
    
+   const rshell = require('./..')({
+   	port,
+   	welcome:  `welcome..beep..boop..\n\n`,
+   	userpass: process.env.shellusers.split(","),
+   	allowed: (req,res) => String(req.headers['user-agent']).match(/curl\//) && rshell.userpass.length
+   })
+   
+   setInterval( () => {
+   	console.log("test")
+   	console.error("this is an example error")
+   },1000)
+   
+   app.use( rshell.middleware )
+   rshell.start()
    
    app.get('/', (req, res) => {
      res.send('Hello World!')
    })
    
    app.listen(port, () => {
      console.log(`listening at http://localhost:${port}`)
    })
```

> Now **only** host this locally, or through an SSL proxy, SSH tunnel or intranet.
> Simple HTTP let's anybody see the username/password (oops!). 

```
$ RSHELL_USERS="admin:admin,john:doe" node app.js
listening at 8080
[rshell] for terminal access run: $ curl -sSNT. localhost:8080 -u username:password 
```

# Meanwhile somewhere else 

```
$ curl -sSNT. localhost:8080 -u admin:admin 
welcome..beep..boop..

01-28 15:45:45 log: test
01-28 15:45:45 err: this is an example error
01-28 15:45:46 log: test
01-28 15:45:46 err: this is an example error
01-28 15:45:47 log: test
01-28 15:45:47 err: this is an example error

```

```
$ curl -sSNT. localhost:8080 -u admin:admin | grep err:
01-28 15:45:45 err: this is an example error
01-28 15:45:46 err: this is an example error
01-28 15:45:47 err: this is an example error

```
