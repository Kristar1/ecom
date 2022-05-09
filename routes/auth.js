const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();

    const accessToken = jwt.sign(
      {
          id: savedUser._id,
          isAdmin: savedUser.isAdmin,
      },
      process.env.JWT_SEC,
          {expiresIn:"3d"}
      );

      const { password, ...others } = savedUser._doc;  
      res.status(200).json({...others, accessToken});
    // res.status(200).json(accessToken)
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

//LOGIN

router.post("/login", async (req, res) => {
    try{
        const user = await User.findOne(
            {
                email: req.body.email,
            }
        );

        !user && res.status(401).json("Wrong User email");

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SEC
        );


        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        const inputPassword = req.body.password;
        
        originalPassword != inputPassword && 
            res.status(401).json("Wrong Password");

        const accessToken = jwt.sign(
        {
            id: user._id,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
            {expiresIn:"3d"}
        );
  
        const { password, ...others } = user._doc;  
        res.status(200).json({...others, accessToken});

    }catch(err){
        res.status(500).json(err);
        console.log(err)
    }

});

module.exports = router;