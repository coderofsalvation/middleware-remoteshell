

module.exports = (rshell) => {

    console.error = (function(error) {
        var fnew = function(a, b, c, d, e, f) {
            error.call(console, a)
			for ( var j in rshell.clients )
				if( rshell.clients[j].stderr )
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
				if( rshell.clients[j].stdout )
					rshell.clients[j].res.write(rshell.date()+' log: '+string)
        };
        fnew.undo = ((write) => () => process.stdout.write = write )(write)
        return fnew
    }(process.stdout.write));


}
