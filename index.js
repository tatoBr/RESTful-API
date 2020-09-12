const app = require('./bin/app');
const { port } = require('./bin/variables')

app.listen(port, console.log( `Server listenig at port ${ port }.`));