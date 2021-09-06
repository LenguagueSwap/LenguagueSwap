const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const estudianteSchema = new Schema({
    nickname : {
        type : String,
        trim:true,
        required : true
    },
    email : {
        type : String,
        trim:true,
        required : true
    },
    password : {
		type : String,
		required : true,
        trim:true
	},
    avatar : {
        type : Buffer
    },
    idiomaNativo : {
		type : String,
		required : true
	},
    idiomaDeInteres : {
		type : String,
		required : true
	},
    age : {
		type : Number
	},
    country : {
		type : String
	},
    gender : {
		type : String,
        default : "gender"
	},
    description : {
		type : String
	},
    friends :[{
        type : Schema.Types.ObjectId,
        ref : 'Estudiante'
    }]
});

const Estudiante = mongoose.model('Estudiante', estudianteSchema);

module.exports = Estudiante 
