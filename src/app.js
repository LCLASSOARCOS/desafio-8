//app.js nuevo
import express from 'express';
import session from 'express-session';
import exphbs from 'express-handlebars';
import LocalStrategy from 'passport-local';
import { Server } from 'socket.io';
import './database.js';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import viewsRouter from './routes/views.router.js';
import userRouter from './routes/user.router.js';
//import sessionRouter from './routes/session.router.js';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import mongoose from 'mongoose';
import configObject from './config/config.js';
import cors from 'cors';
import authMiddleware from './middleware/authmiddleware.js';
import UsersModel from './models/users.model.js';
import MessageModel from './models/mesagge.model.js';
import MongoStore from "connect-mongo";
const app = express();
const { mongo_url, puerto } = configObject;
import cookieParser from 'cookie-parser';
import compression from "express-compression"; 
import { errorHandler } from './middleware/errorHandler.js';





// Middleware


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));
app.use(cors());
//GZIP: 
app.use(compression());
// Configuración de express-session
app.use(session({
    store: MongoStore.create({ mongoUrl: mongo_url, ttl: 86400 }),
    secret: "secretCoder",
    resave: true,
    saveUninitialized: true,
}));

// Manejo de errores
app.use(errorHandler);

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());
  initializePassport();
  
// Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/", viewsRouter);



app.get('/pruebas', async (req, res) => {
    try {
        const usuarios = await UsersModel.find();
        res.send(usuarios);
    } catch (error) {
        res.status(500).send('Error de servidor');
    }
});

// Conexión a MongoDB
mongoose.connect(mongo_url)
    .then(() => console.log('Conectados a la BD'))
    .catch(() => console.log('Error al conectar a la BD'));

// Inicialización del servidor
const httpServer = app.listen(puerto, () => {
    console.log(`Escuchando en el puerto: ${puerto}`);
});

// Chat en el ecommerce
const io = new Server(httpServer);

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    socket.on('message', async (data) => {
        await MessageModel.create(data);
        const messages = await MessageModel.find();
        io.sockets.emit('messagesLogs', messages);
    });

    socket.on('add_product', async (newProduct) => {
        try {
            const ps = new ProductsService();
            const result = await ps.addProduct(newProduct);
            if (result.status) {
                io.emit('products', { products: await ps.getProducts({ limit: 100 }) });
                socket.emit('success');
            } else {
                socket.emit('error', { message: result.msg });
            }
        } catch (error) {
            socket.emit('error', { message: 'Error al agregar el producto: ' + error.message });
        }
    });
});


//websocket
///Websockets: 

//import SocketManager from './sockets/socketmanager.js';
//new SocketManager(httpServer);