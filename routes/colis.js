const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Ajouter un colis
router.post('/', (req, res) => {
    const { TypeColis, NumeroColis, NomColis, Description, PoidsOuVolume, PointDepart, PointDestination, UrgenceLivraison, EtatLivraison, ModeLivraison, PhotoColis, destinataire_id } = req.body;

    if (!TypeColis || !NumeroColis || !NomColis || !PoidsOuVolume || !PointDepart || !PointDestination || !destinataire_id) {
        return res.status(400).json({ message: 'Tous les champs requis ne sont pas remplis' });
    }

    db.query(
        'INSERT INTO Colis (TypeColis, NumeroColis, NomColis, Description, PoidsOuVolume, PointDepart, PointDestination, UrgenceLivraison, EtatLivraison, ModeLivraison, PhotoColis, DestinataireId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [TypeColis, NumeroColis, NomColis, Description, PoidsOuVolume, PointDepart, PointDestination, UrgenceLivraison || false, EtatLivraison || 'En attente', ModeLivraison, PhotoColis, destinataire_id],
        (err) => {
            if (err) {
                console.error('Erreur SQL :', err.message);
                return res.status(500).json({ message: 'Erreur interne du serveur' });
            }
            res.status(201).json({ message: 'Colis ajouté avec succès' });
        }
    );
});

// Liste des colis
router.get('/', (req, res) => {
    db.query('SELECT * FROM Colis', (err, results) => {
        if (err) {
            console.error('Erreur SQL :', err.message);
            return res.status(500).json({ message: 'Erreur interne du serveur' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
