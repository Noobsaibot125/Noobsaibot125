const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, role, agence_id } = req.body;

    // Vérification de la présence des champs requis
    if (!first_name || !last_name || !email || !password || !role || !agence_id) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion dans la base de données
    db.query(
        'INSERT INTO users (first_name, last_name, email, Password, role, AgenceId) VALUES (?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, hashedPassword, role, agence_id],
        (err, results) => {
            if (err) {
                console.error('Erreur lors de l\'insertion dans la base de données:', err);  // Afficher l'erreur complète
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Cet email est déjà utilisé' });
                }
                return res.status(500).json({ message: 'Erreur du serveur' });
            }
            res.status(201).json({ message: 'Utilisateur créé avec succès' });
        }
    );
});

// Connexion
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    db.query('SELECT * FROM users WHERE Email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.Password);

        if (!match) {
            return res.status(403).json({ message: 'Mot de passe incorrect' });
        }

        // Génération du token JWT
        const token = jwt.sign(
            { id: user.id, email: user.Email, role: user.Role, agence_id: user.AgenceId }, // Changer user.Id par user.id
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Connexion réussie', token });
    });
});

module.exports = router;
