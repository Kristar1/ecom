const mongoose= require('mongoose')

const PaymentSchema= new mongoose.Schema({

    entity:{type:String},
    account_id:{type:String},
    event:{type:String},
    payload:{type:Object},
    bank:{type:String, default:null},
    wallet:{type:String, default:null},
    vpa:{type:String, default:null},
    email:{type:String},
    contact:{type:String},
    fee:{type:String},
   
   
},{timestamps:true})

module.exports= mongoose.model("Payment", PaymentSchema)