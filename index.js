const express = require('express')
const path = require('path');
const mysql = require('mysql2');
const app = express()
const port = 80;
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('images'));
app.use(express.static('public'));



// face of the website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+"/index.html"));
});


// setting up database connection
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Vimal@9440942366',
    database: 'certrack'
});

con.connect();




//globally storing the credentials
var username="", password="";




// validate credentials: username and password

app.post('/login', (req, res)=>{
    // console.log(req.body);


    // if the id exists
    if(req.body.uname!='' && req.body.password!='') {

        let sql = "select * from users where uname = ?";

        // check if the username is registered or not
        con.query(sql, [req.body.uname], (err, results, fields)=>{

            // validate the password
            if(results[0].pass == req.body.password){
                username = req.body.uname;
                password = req.body.password;
                // console.log(results);
                
                
                // display the content
                // render the user's content
                var sql1 = `select * from ${username}`;
                con.query(sql1, (err, data, fields)=>{
                    console.log(data);
                    res.render('home', {data});
                });

            }
                
            else {
                const msg = "invalid details";
                console.log(msg);
            }
        });
        
    }

    //the user wants to register
    else {
        res.sendFile(path.join(__dirname+"/files/signup.html"));
    }
});

app.post('/signup', (req, res)=>{
    let uname = req.body.uname;
    let pass1 = req.body.password;
    let pass2 = req.body.password2;

    if(uname!='' && pass1!='' && pass2!='') {
        if(pass1 == pass2) {

            // create a user record
            let sql = "insert into users values(?,?)";
            con.query(sql, [uname, pass1], (err, rows, fields)=>{
                // console.log(rows);
            })


            // create a table to store indiviual user file paths
            sql = `create table ${uname} (certs varchar(50))`;
            
            con.query(sql, (err, rows, fields)=>{
                console.log("table created");
            });


            res.sendFile(path.join(__dirname+"/index.html"));

            // // display the content
            // sql = `select * from ${uname}`;
            // con.query(sql, (err, data, fields)=>{
            //     // console.log(data);
            //     res.render('home', {data});
            // });
        }
        else {
            res.write('enter correctly');
            // res.send(`<script>alert("enter the details properly");</script>`)
        }
    }
});


// using express-fileupload to upload files
const fileUpload = require('express-fileupload');

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: 'public/'
}));


app.post('/uploadfile', (req, res)=> {


    // upload file into images folder
    let fname = req.files.pic.name;
    console.log(req.files.pic);
    let newPath = path.join(process.cwd(), 'images', fname);
    req.files.pic.mv(newPath);
    console.log(newPath);



    //update database
    var sql = `insert into ${username} values(?)`;
    let content = "/"+fname;
    content = content.toLowerCase();
    con.query(sql, [content], (err, rows, fields)=>{
    });  
    
    
    // display the content
    sql = `select * from ${username}`;
    con.query(sql, (err, data, fields)=>{
        // console.log(data);
        res.render('home', {data});
    });
    
});




app.listen(port);