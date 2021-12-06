const express = require('express')
const mongoose = require('mongoose')
const ejs = require('ejs');
const PORT = 8000;
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
const regForName = RegExp(/^[A-Za-z]/);
const regForEmail = RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const regForMobile = RegExp(/^[0-9]{10}$/);
//dbconnection 
const db = "mongodb://localhost:27017/mongocrud2";
const connectDB = async () => {
    try {
        await mongoose.connect(db, { useNewUrlParser: true });
        console.log("MongoDB connected")
    }
    catch (err) {
        console.log(err.message);
    }
}
connectDB();
//end
const catModel = require('./db/regSchema')

app.get('/', (req, res) => {
    res.render('Reg', { err: "", errName: "", errMobile: "", errEmail: "" })
})
app.post('/submit', (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let mobile = req.body.mobile;
    console.log(regForName.test(name))

    if (name === "" || email === "" || mobile === "") {
        res.render("Reg", { err: "Fields should not be empty", errName: "", errMobile: "", errEmail: "" })
    }
    else {
        if (regForName.test(name) === false) {
            res.render("Reg", { errName: "Name is not Valid", err: "", errMobile: "", errEmail: "" })
        }
        else if (regForEmail.test(email) === false) {
            res.render("Reg", { errEmail: "Email is not Valid", err: "", errMobile: "", errName: "" })
        }
        else if (regForMobile.test(mobile) === false) {
            res.render("Reg", { errMobile: "Mobile number is not Valid", err: "", errName: "", errEmail: "" })
        }
        else {
            let ins = new catModel({ name: name, email: email, mobile: mobile });
            ins.save((err) => {
                if (err) {
                    console.log(err)
                    res.send("Already Added")
                }
                else {
                    res.send("Data Added");
                }
            })
        }
    }

})
app.get('/table', (req, res) => {

    catModel.find({}, (err, data) => {
        if (err) throw err;
        res.render('table', { data })
    })
})
app.get("/deldata/:_id", (req, res) => {
    let id = req.params._id;
    console.log(id)
    catModel.deleteOne({ _id: id }, (err) => {
        if (err) throw err
        console.log("no err")
    })
    res.redirect('/table')
})
app.get("/updatedata/:id&&:name&&:email&&:mobile",(req,res)=>{
    let id=req.params.id;
    let mod=[]
    let name=req.params.name;
    let email=req.params.email;
    let mobile=req.params.mobile;

    res.render('update',{name:name,id:id,email:email,mobile:mobile})
  
})
app.post("/final_update/:id",(req,res)=>{
    let id=req.params.id;
    let name=req.body.name;
    let email=req.body.email;
    let mobile=req.body.mobile;
   
    catModel.updateOne({_id:id},{$set:{name:name,email:email,mobile:mobile}},(err)=>{
        if(err) throw err;
        else {
            res.redirect("/table");
        }
    })
  
})

app.listen(PORT, (err) => {
    if (err) throw err;
    else {
        console.log("Server runs on " + PORT)
    }
})
