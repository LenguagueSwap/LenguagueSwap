socket = io()

//Elements of the chat
const formulario = document.querySelector('#formulario')
const translate = document.querySelector('#translate')
const mensaje = formulario.querySelector('#message')
const usuario = formulario.querySelector('#usuario').value
const nameUser = formulario.querySelector('#nameUser').value
const e = formulario.querySelector('#boxChat')

//Elements of the translator
const formTraduction = document.querySelector('#formTraduction')
const formChange = document.querySelector('#formChange')
const fromLanguage = translate.querySelector('#fromLanguage')
const toLanguage = formTraduction.querySelector('#toLanguage')
const texto = translate.querySelector('#texto')
const traduction = formTraduction.querySelector('#traduction')
const btnClear = formTraduction.querySelector('#clear')
const btnChange = formChange.querySelector('#changeLanguage')

btnChange.addEventListener('click', ()=>{
    console.log(fromLanguage.value)
    if(fromLanguage.value=="Spanish"){
        fromLanguage.value="English"
        toLanguage.value="Spanish"
    }else if (fromLanguage.value=="English"){
        fromLanguage.value="Spanish"
        toLanguage.value="English"
    }
})

//clean the translator text
btnClear.addEventListener('click', ()=>{
    texto.value=""
    traduction.value=""
    texto.focus()
})

// element.removeEventListener('dblclick', this, false)

//translator
translate.addEventListener('submit', (datos)=>{ 
    datos.preventDefault()
    socket.emit("translate", { text:texto.value, from:fromLanguage.value, to:toLanguage.value} );
})

socket.on("traduction", (text)=>{
    traduction.innerHTML = `${text}`
})

formulario.addEventListener('submit', (datos)=>{
    datos.preventDefault()
    socket.emit("texto", {usuario:usuario, mensaje:mensaje.value, nameUser:nameUser}, () => {
        mensaje.value=""
        mensaje.focus()
    })
})

mensaje.addEventListener('keypress', function (){
    socket.emit('userTyping', nameUser);
})

socket.on('userTyping', (usuario)=>{
    chatActions.innerHTML = `<p class="itemAction">${usuario} is writing ...</p>` 
})

socket.on("historial", (datos)=>{
    conversacion=datos.historial
    nuevo=usuario;
    idSocket=datos.idSocket;
    socket.emit("nuevoParticipante", {participante:nuevo, idSockekIO:idSocket});
    conversacion.forEach(data => {
        if(usuario==data._id){
            boxChat.innerHTML += '<p class="msg-same"><span class="user-same">' + 'Me' + ' :</span> '+ data.mensaje  + "</p>"
            var objDiv = document.getElementById("boxChat");
            objDiv.scrollTop = objDiv.scrollHeight;
        }else{
            boxChat.innerHTML += '<p class="msg-other"><span class="user-other">' + data.nameUser + ' :</span> '+ data.mensaje  + "</p>"
            var objDiv = document.getElementById("boxChat");
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    });
})

socket.on("nuevoParticipante", (datos)=>{
    if(datos._id==usuario){
        boxChat.innerHTML += `<p class="msg-same" style="background-color: rgb(31 32 30 / 56%); color: #096f0f; margin: 20px auto;">You have joined the chat</p>`
    }else{
        boxChat.innerHTML += `<p class="msg-same" style="background-color: rgb(31 32 30 / 56%); color: #096f0f; margin: 20px auto;"> <span style="color: #1e90ff">${datos.newUser}</span> has joined the chat </p>`
    }
    sidePanel.innerHTML = `<div class="userCounter"><i class="fas fa-users"></i>&nbsp;<span id="userCounter"></span></div>`
    // <div class="target-user" id="targetUser" style="background-color:#547718;color:black">Me</div>
    datos.participantes.forEach(element=>{
        if(usuario!=element._id){
            sidePanel.innerHTML += `<div class="target-user" id="targetUser">${element.user.nickname}</div>` 
        }
    })
    userCounter.innerHTML = `${datos.count}` 
    
    var objDiv = document.getElementById("boxChat");
    objDiv.scrollTop = objDiv.scrollHeight;
})

socket.on("mensaje", (data)=>{
    if(usuario==data.usuario){
        boxChat.innerHTML += '<p class="msg-same"><span class="user-same">' + 'Me' + ' :</span> '+ data.mensaje  + "</p>"
        var objDiv = document.getElementById("boxChat");
        objDiv.scrollTop = objDiv.scrollHeight;
    }else{
        chatActions.innerHTML = `<p></p>` 
        boxChat.innerHTML += '<p class="msg-other"><span class="user-other">' + data.nameUser + ' :</span> '+ data.mensaje  + "</p>"
        var objDiv = document.getElementById("boxChat");
        objDiv.scrollTop = objDiv.scrollHeight;
    }
})

socket.on("disconnet", (datos)=>{
    datos.participantes.forEach(element=>{
        sidePanel.innerHTML = `<div class="userCounter"><i class="fas fa-users"></i>&nbsp;<span id="userCounter"></span></div>`
        if(usuario!=element._id){
            sidePanel.innerHTML += `<div class="target-user" id="targetUser">${element.user.nickname}</div>` 
        }
    })
    userCounter.innerHTML = `${datos.count}`
    boxChat.innerHTML += `<p class="msg-same" style="background-color: rgb(31 32 30 / 56%); color: darkgray; margin: 20px auto;"> <span style="color: #1e90ff">${datos.desconectado}</span> has disconnected </p>`
})

