const express = require('express');
const app = express();

const cors = require('cors');
const corsOptions = {
    origin: 'https://delivery-app-self.vercel.app/',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//const dotenv = require('dotenv');
//dotenv.config();

const port = 7000;

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = {
    "type": process.env.TYPE,
    "project_id": process.env.PROJECT_ID,
    "private_key_id": process.env.PRIVATE_KEY_ID,
    "private_key": process.env.PRIVATE_KEY,
    "client_email": process.env.CLIENT_EMAIL,
    "client_id": process.env.CLIENT_ID,
    "auth_uri": process.env.AUTH_URI,
    "token_uri": process.env.TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
    "universe_domain": process.env.UNIVERSE_DOMAIN
};

const fireBaseApp = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: ''
});

const db = getFirestore();

app.get('/products', cors(corsOptions), async (req, res) => {
    const selectedShopId = Number(req.query.shopId);

    const productsRef = db.collection('products');
    const snapshot = await productsRef.where('shopId', '==', selectedShopId).get();
    let products = [];
    if (snapshot.empty) {
        res.send(JSON.stringify('Цей магазин немає товарів.'));
    }
    else {
        snapshot.forEach(doc => {
            products.push({'id': doc.id,'content': doc.data()});
        });
        res.send(products);
    }
});

app.get('/shops', cors(corsOptions), async (req, res) => {
    const shopsRef = db.collection('shops');
    const snapshot = await shopsRef.get();
    let shops = [];
    if (snapshot.empty) {
        res.send('No matching documents.');
        console.log('No matching documents.');
    }
    else {
        snapshot.forEach(doc => {
            shops.push({'id': doc.id,'content': doc.data()});
        });
        res.send(shops);
        console.log(shops);
    }
});

app.post('/orders', cors(corsOptions), async (req, res) => {
    const data = req.body;
    const response = await db.collection('orders').doc().set(data);
    res.send(JSON.stringify('Замовлення оформлено!' + response));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});