require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//connect to MongoDB
connectDB();

//custom middleware logger
app.use(logger);

//handle options credentials check - before CORS
//and fetch cookies credentials requirement to prevent 'Access-Control-Allowed-Origins' error on the browser
app.use(credentials);

//cross origin resource sharing
app.use(cors(corsOptions));

//built-in middleware to handle urlencoded form data
app.use(express.urlencoded({extended: false}));

//built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

//routes
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/predict', require('./routes/predict'));

//app.use(verifyJWT); //to protect routes and verify the user before giving access

app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('json')) {
        res.json({ "error" : "404 not found"})
    }
    else {
        res.type('txt').send('404 not found');
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => { console.log(`Server is listening on port ${PORT}`)});
})
