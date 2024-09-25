const Condominium = require('../models/Condominium');

// Create a new condominium
exports.createCondominium = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const newCondominium = await Condominium.create({ name });
        return res.status(201).json(newCondominium);
    } catch (error) {
        return res.status(500).json({ error: 'Error creating condominium', details: error.message });
    }
};

// Get all condominiums
exports.getAllCondominiums = async (req, res) => {
    try {
        const condominiums = await Condominium.findAll();
        return res.status(200).json(condominiums);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching condominiums', details: error.message });
    }
};

// Get a single condominium by ID
exports.getCondominiumById = async (req, res) => {
    try {
        const { id } = req.params;
        const condominium = await Condominium.findByPk(id);

        if (!condominium) {
            return res.status(404).json({ error: 'Condominium not found' });
        }

        return res.status(200).json(condominium);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching condominium', details: error.message });
    }
};

// Update a condominium by ID
exports.updateCondominium = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const condominium = await Condominium.findByPk(id);
        if (!condominium) {
            return res.status(404).json({ error: 'Condominium not found' });
        }

        condominium.name = name || condominium.name;
        await condominium.save();

        return res.status(200).json(condominium);
    } catch (error) {
        return res.status(500).json({ error: 'Error updating condominium', details: error.message });
    }
};

// Delete a condominium by ID
exports.deleteCondominium = async (req, res) => {
    try {
        const { id } = req.params;

        const condominium = await Condominium.findByPk(id);
        if (!condominium) {
            return res.status(404).json({ error: 'Condominium not found' });
        }

        await condominium.destroy();
        return res.status(200).json({ message: 'Condominium deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting condominium', details: error.message });
    }
};
