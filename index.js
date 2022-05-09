const express= require('express');
const app= express();
const cors =require('cors');
const userRoute= require('./routes/user')
const authRoute= require('./routes/auth')
const productRoute= require('./routes/product')
const orderRoute= require('./routes/order')
const cartRoute= require('./routes/cart')
const mongoose= require('mongoose');
const dotenv = require('dotenv');
const Razorpay = require('razorpay')
const shortid = require('shortid');
const bodyParser = require('body-parser');
dotenv.config()
var nodemailer = require('nodemailer');
const Payment = require('./models/Payment');

var path = require("path");


mongoose.connect(process.env.MONGO_URL || "mongodb+srv://kristar:Kedia12345@cluster1.7h86y.mongodb.net/shop?retryWrites=true&w=majority").then(()=>console.log("Connect to MongoDB")).catch((error)=>console.log(error))

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json())

app.use("/api/users", userRoute)
app.use("/api/auth", authRoute)
app.use("/api/products", productRoute)
app.use("/api/orders", orderRoute )
app.use("/api/cart", cartRoute )

const razorpay = new Razorpay({
	key_id: 'rzp_test_BkVywjqSOTnbGg',
	key_secret: '8MzjFnTEMNriQan0JbWTKiJD'
})

app.post('/verification', (req, res) => {
	// do a validation
	const secret = '12345678'

	console.log(req.body)

	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		// require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4));
	const newPayment= new Payment(req.body);
	const savedPayment=  newPayment.save();

	} else {
		// pass it
		res.status(502)
	}
	res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {
	const payment_capture = 1

	const options = {
		amount: req.body.amount ,
		currency: req.body.currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		// console.log(response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})
app.post('/api/checkpaid', async(req,res)=>{
	 try {
		const checkPaid = Payment.findOne({order_id:req.body.orderId});
		console.log(checkPaid)
		if(checkPaid){
			res.json(true)
		}else{
			res.json(false)
		}
	
	 } catch (error) {
		 console.log(error)
	 }
	
})


app.post('/registermail', async (req, res) => {
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
		  user: 'letsmakeyoufit@gmail.com',
		  pass: 'krish@greatestinstapage'
		}
	  });
	  
	  var mailOptions = {
		from: 'letsmakeyoufit@gmail.com',
		to: req.body.email,
		subject: 'Thank You for Signing Up',
		text: `I hope that you will enjoy are news letters which would be packed with knowledge.`
		// html: '<h1>Thank You for signing Up</h1>'        
	  };
	
		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
			console.log(error);
		  } else {
			console.log('Email sent: ' + info.response);
		  }
		
		})

})












app.use(express.static(path.resolve(__dirname, "./market/build")));
// Step 2:
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./market/build", "index.html"));
});










app.listen(process.env.PORT || 5000 ,()=>[
    console.log(`server started on ${process.env.PORT || 5000}`)
]) 