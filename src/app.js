//Requires
require('./config/config')
const express = require("express")
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const Estudiante = require('./models/estudiantes');
const bodyParser = require('body-parser');
const session = require('express-session');
var MemoryStore = require('memorystore')(session)
const translate = require('@vitalets/google-translate-api');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

global.conversacion=[];
global.participantes=[];

io.on('connection', client => {
	client.emit("historial", {historial:conversacion, idSocket:client.id})
	
	client.on("nuevoParticipante", async (newConection)=>{
	
		const usuario = await Estudiante.findById(newConection.participante)	

		let newClient = {
			user:usuario,
			id:newConection.idSockekIO
		}
		repetido = participantes.find(element => element.user._id== newConection.participante)

		if(!repetido){
			participantes.push(newClient)
		} 
		
		contador=participantes.length

		io.emit('nuevoParticipante', {newUser:newClient.user.nickname, _id:newClient.user._id, participantes:participantes,  count:contador})
	})

	client.on('userTyping',(usuario)=>{
		client.broadcast.emit('userTyping', usuario);
	})
	
	client.on("texto", (data, callback) => {
		conversacion.push(data);
		io.emit("mensaje", data);
		callback()
	})

	client.on("translate", (data)=>{

		translate(data.text, {from: `${data.from}` , to:`${data.to}`}).then(res => {
			// console.log(res.from.language.iso);
			client.emit("traduction", res.text);
		}).catch(err => {
			console.error(err);
		});
	})

	client.on('event', data => { /* … */ });
	
	client.on('disconnect', () => {
		desconectado = participantes.find(conection => conection.id==client.id)
		
		newList = participantes.filter(conection => conection.id!=client.id)
		participantes=newList;

		if(desconectado){
			contador=participantes.length
			io.emit('disconnet', {desconectado:desconectado.user.nickname, participantes:participantes, count:contador});
		}
	});

	// client.on('userDisconnected', (usuario) =>{
	// 	newList = participantes.filter(element => element._id!=usuario)
	// 	console.log( "Esta es la nueva lista --> "+ newList)
	// })
});


app.use(session({
	cookie: { maxAge: 86400000 },
	store: new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	}),
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true
}))

app.use((req, res, next) => {
	if (req.session.usuario) {
		res.locals.sesion = true
		res.locals.nombre = req.session.nombre
	}
	next()
})

//Paths
const dirPublic = path.join(__dirname, '../public')
//Statics
app.use(express.static(dirPublic))

//BodyParser 
app.use(bodyParser.urlencoded({ extended: false }))

//Routes
app.use(require('./routes/index'))

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useUnifiedTopology: true }, (err, resultado) => {
	if (err) {
		return console.log(error)
	}
	console.log("conectado")
});

// SETINGS 
const port = process.env.PORT || 3000

//SERVIDOR

server.listen(port, () => {
	console.log(`server on port  ${port}`)
});
