const express = require('express');
const db = require('../config/db');
const jwt = require('jsonwebtoken');        
require('dotenv').config();

const router = express.Router();

// Middleware pour vérifier le token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).send('Accès refusé : Token manquant');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Token invalide');
        req.user = user;
        next();
    });
};

// Créer une agence (Uniquement accessible par un admin)
router.post('/', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Accès interdit');
    }

    const { nom_agence, adresse_agence, pays_agence, devise_agence, prix_au_kg } = req.body;

    if (!nom_agence || !adresse_agence || !pays_agence || !devise_agence || !prix_au_kg) {
        return res.status(400).send('Tous les champs sont requis');
    }

    db.query(
        'INSERT INTO agences (NomAgence, AdresseAgence, PaysAgence, DeviseAgence, PrixAuKg) VALUES (?, ?, ?, ?, ?)',
        [nom_agence, adresse_agence, pays_agence, devise_agence, prix_au_kg],
        (err) => {
            if (err) {
                return res.status(500).send('Erreur lors de la création de l\'agence');
            }
            res.status(201).send('Agence créée avec succès');
        }
    );
});

// Récupérer toutes les agences
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM agences', (err, results) => {
        if (err) {
            return res.status(500).send('Erreur lors de la récupération des agences');
        }
        res.json(results);
    });
});

module.exports = router;
