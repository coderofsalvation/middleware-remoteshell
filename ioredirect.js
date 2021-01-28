

module.exports = (rshell) => {

    console.error = (function(error) {
        var fnew = function(a, b, c, d, e, f) {
            error.call(console, a)
			for ( var j in rshell.clients )
				if( rshell.clients[j] )
					rshell.clients[j].res.write(rshell.date()+' err: '+a+"\n")
        };
        fnew.undo = ((orig) => () => console.error = orig )(console.error)
        return fnew
    }(console.error));

    process.on('uncaughtException',  function(err) {
        console.error('uncaughtException: ' + err);
    })

    process.stdout.write = (function(write) {
        var fnew = function(string, encoding, fd) {
            write.call(process.stdout, string, encoding, fd);
			for ( var j in rshell.clients )
				if( rshell.clients[j] )
					rshell.clients[j].res.write(rshell.date()+' log: '+string)
        };
        fnew.undo = ((write) => () => process.stdout.write = write )(write)
        return fnew
    }(process.stdout.write));

    return {

/* TODO
        toggle: (type, cache, i) =>{
            let id     = i.req.socket.remotePort
            let client = rshell.clients[id] 
            client[type] = !client[type]
            if( !cache.inited ){
                on('*', (i, o, e) => {
                    if( i.plugin == type && !i.seen ) 
                        for ( var j in rshell.clients )
                            if( rshell.clients[j][type] )
                                rshell.clients[j].res.write(rshell.date()+' '+i.output)
                    i.seen = true
                })
                cache.inited = true
            }
            return type+" "+(client[type] ? "enabled" : "disabled")
        }
*/

    }

}
