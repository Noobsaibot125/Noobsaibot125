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

// Ajouter un destinataire
router.post('/', authenticateToken, (req, res) => {
    const { nom, prenom, date_de_naissance, telephone, email, adresse, lieu_de_livraison } = req.body;

    if (!nom || !prenom || !date_de_naissance || !telephone || !email || !adresse || !lieu_de_livraison) {
        return res.status(400).send('Tous les champs sont requis');
    }

    db.query(
        'INSERT INTO destinataires (Nom, Prenom, DateDeNaissance, Telephone, Email, Adresse, LieuDeLivraison, UserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nom, prenom, date_de_naissance, telephone, email, adresse, lieu_de_livraison, req.user.id],
        (err, result) => {
            if (err) {
                return res.status(500).send('Erreur lors de l\'ajout du destinataire');
            }
            const destinataire_id = result.insertId;
            res.status(201).send({ message: 'Destinataire ajouté avec succès', destinataire_id });
        }
    );
});

// Récupérer tous les destinataires
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM destinataires WHERE UserId = ?', [req.user.id], (err, results) => {
        if (err) {
            return res.status(500).send('Erreur lors de la récupération des destinataires');
        }
        res.json(results);
    });
});

module.exports = router;
