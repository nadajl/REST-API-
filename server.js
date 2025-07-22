// Importation des packages nécessaires
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config({ path: './config/.env' });

// Importation du modèle User
const User = require('./models/User');

// Initialisation de l'application Express
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Connexion à la base de données MongoDB avec Mongoose
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// ROUTES

// GET : Récupérer tous les utilisateurs avec pagination et filtrage
app.get('/api/users', async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtrage (par exemple : ?name=John&age=30)
    const filter = {};
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.email) filter.email = { $regex: req.query.email, $options: 'i' };
    if (req.query.age) filter.age = Number(req.query.age);

    const users = await User.find(filter).skip(skip).limit(limit);
    const total = await User.countDocuments(filter);

    res.json({
      total,
      page,
      pageSize: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST : Créer un utilisateur
app.post('/api/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET : Récupérer un utilisateur par ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT : Modifier un utilisateur par ID
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove a user by ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});