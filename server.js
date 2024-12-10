

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:8000', // URL de votre application Laravel
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// Importer les routes des différentes entités
const agenceRoutes = require('./routes/agences');
const colisRoutes = require('./routes/colis');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const destinataireRoutes = require('./routes/destinataire');

// Configurer dotenv si vous avez besoin de variables d'environnement
dotenv.config();

// Middleware pour gérer le corps des requêtes JSON
app.use(bodyParser.json());

// Définir les routes de l'API
app.use('/agence', agenceRoutes);
app.use('/colis', colisRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/destinataire', destinataireRoutes);
    
// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
