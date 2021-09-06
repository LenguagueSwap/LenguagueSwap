const express = require("express");
const app = express();
// const parseurl = require('parseurl');
const path = require('path');
const hbs = require('hbs');
const Estudiante = require('./../models/estudiantes');
const Curso = require('./../models/cursos');
const bcrypt= require('bcrypt');
const saltRounds = 10;
const dirPartials = path.join(__dirname, '../../template/partials');
const dirViews = path.join(__dirname, '../../template/views');
var multer  = require('multer');

require('./../helpers/helpers')

//HBS
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

//PAGINAS
app.get('/inicio', (req, res) => {
    res.redirect('/')
});

app.get('/', (req, res) => {
    res.render('index', {
        mostrar:""
    })
});

app.get('/salaGeneral', (req, res) => {
    res.render('sala', {
        nombre: `${req.session.usuario.nickname}`,
        user: req.session.usuario ,
        avatar: req.session.avatar ,
        mostrar: req.session.mostrar
    })
});

app.post('/login', (req, res) => {
    Estudiante.findOne({nickname:req.body.nickname}, (err, estudiante) => {
        texto = "";
        if (err) {
            return console.log(err)
        } else if (estudiante){
            if(bcrypt.compareSync(req.body.password, estudiante.password)){
                req.session.usuario = estudiante;
                req.session.mostrar = "";
                req.session.avatar = estudiante.avatar.toString('base64')
                return res.redirect('salaGeneral')
            }else {
                texto = `Contraseña incorrecta`
                res.render('index', {
                    mostrar:texto                    
                })
            }
        }else{
            texto = `Usuario o contraseña incorrecta`
            res.render('index', {
                mostrar:texto                   
            })
        }   
    })
});

app.post('/register', (req, res) => {
    Estudiante.findOne({nickname:req.body.nickname},(err, encontrado)=>{
        if(err){
            return console.log(err)
        }
        if(encontrado){
            res.render('index', {
                mostrar:`<div class="alert alert-danger alert-dismissible fade show" role="alert">
                             El usuario ${encontrado.nickname} ya existe, elije uno diferente por favor
                             <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                         </div>`
            })
        }else{
            const imagen = "public/uploads/user-avatar"
            const salt = bcrypt.genSaltSync(saltRounds);
            let estudiante = new Estudiante({
                nickname: req.body.nickname,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, salt),
                idiomaDeInteres:req.body.idiomaDeInteres,
                idiomaNativo:req.body.idiomaNativo,
                description: " Write a short description about yourself..",
                avatar: imagen
            })
            estudiante.save((err, resultado) => {
                if (err) {
                    return console.log(err)
                }
                res.render('index', {
                    mostrar: `<div class="alert alert-info alert-dismissible fade show" role="alert">
                                 Welcome ${req.body.nickname}
                                 <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                             </div>`
                })
            })
        }
    })
});

/*
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname +"De" + req.session.usuario.nickname + path.extname(file.originalname))
    }
})*/
   
var upload = multer({  })

// edit profile
app.post('/editImage', upload.single('photo'), (req, res) => {
    Estudiante.findOneAndUpdate({_id:req.session.usuario._id}, { avatar : req.file.buffer }, {new:true}, (err, usuario)=>{
        if(err){
            return console.log(err)
        }
        req.session.avatar = usuario.avatar.toString('base64')
        req.session.mostrar=`<div class="alert alert-danger alert-dismissible fade show" role="alert"> The image was changed <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
        return res.redirect('salaGeneral')
    })
})
app.post('/editProfile', (req, res) => {
    Estudiante.findOneAndUpdate({_id:req.session.usuario._id}, { nickname : req.body.nickname, email: req.body.email, gender:req.body.gender, age:req.body.age, country:req.body.country, idiomaNativo:req.body.idiomaNativo, idiomaDeInteres:req.body.idiomaDeInteres, description:req.body.description}, (err, usuario)=>{
        if(err){
            return console.log(err)
        }
        req.session.mostrar=`<div class="alert alert-danger alert-dismissible fade show" role="alert"> Los cambios han sido realizados <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`
        return res.redirect('salaGeneral')
    })
});

app.post('/signOut', (req, res) => {
	req.session.destroy((err) => {
  		if (err) return console.log(err) 	
	})	
	res.redirect('/')	
})

//ERROR 404
app.get('*', function (req, res) {
    res.render('error');
})

module.exports = app
