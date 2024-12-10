const express = require('express');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// Middleware pour vérifier le token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Récupérer le token depuis les en-têtes
    if (!token) {
        console.error('Erreur : Token manquant');
        return res.status(401).json({ message: 'Accès refusé : Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {  // Vérification du token JWT
        if (err) {
            console.error('Erreur JWT :', err.message);
            return res.status(403).json({ message: 'Token invalide ou expiré' });
        }
        console.log('Token valide. Utilisateur :', user);
        req.user = user;  // Ajouter l'utilisateur dans la requête
        next();  // Passer à la route suivante
    });
};

// Ajouter un produit
router.post('/', authenticateToken, (req, res) => {
    const { quantite, prix_unitaire, prixtotal, dimensions, description, colis_id } = req.body;

    if (!quantite || !prix_unitaire || !prixtotal || !dimensions || !description || !colis_id) {
        return res.status(400).send('Tous les champs sont requis');
    }

    db.query(
        'INSERT INTO products (Quantite, PrixUnitaire, Prixtotal, Dimensions, Description, ColisId, UserId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [quantite, prix_unitaire, prixtotal, dimensions, description, colis_id, req.user.id],
        (err) => {
            if (err) {
                console.error('Erreur SQL:', err);
                return res.status(500).send('Erreur lors de l\'ajout du produit');
            }
            res.status(201).send('Produit ajouté avec succès');
        }
    );
});


// Récupérer tous les produits pour un utilisateur spécifique
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM products WHERE UserId = ?', [req.user.id], (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);  // Afficher l'erreur SQL
            return res.status(500).send('Erreur lors de la récupération des produits');
        }
        res.json(results);  // Renvoyer les produits sous forme de JSON
    });
});

module.exports = router;
