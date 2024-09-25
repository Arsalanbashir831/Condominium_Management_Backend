const Technician = require('../models/Technician'); // Adjust the path according to your project structure
const Condominium = require('../models/Condominium');
const PrefCommunication = require('../models/PrefCommunication');


const getTechniciansByCondominiumId = async (req, res) => {
    const { condominiumId } = req.query; 

    if (!condominiumId) {
        return res.status(400).json({ message: 'CondominiumId query parameter is required.' });
    }

    try {
        const technicians = await Technician.findAll({
            where: { CondominiumId: condominiumId },
            include: [
                {
                    model: Condominium,
                    as: 'condominiumTech', 
                    attributes: ['id', 'name']
                },
                {
                    model: PrefCommunication,
                    as: 'prefCommunication',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!technicians.length) {
            return res.status(404).json({ message: 'No technicians found for this condominium.' });
        }

        res.json(technicians);
    } catch (error) {
        console.error('Error fetching technicians by condominiumId:', error);
        res.status(500).json({ error: 'An error occurred while fetching technicians.' });
    }
};

const getAllTechnicians = async (req, res) => {
    try {
        const technicians = await Technician.findAll({
            include: [
                {
                    model: Condominium,
                    as: 'condominiumTech', 
                    attributes: ['id', 'name']
                },
                {
                    model: PrefCommunication,
                    as: 'prefCommunication',
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!technicians.length) {
            return res.status(404).json({ message: 'No technicians found.' });
        }

        res.json(technicians);
    } catch (error) {
        console.error('Error fetching all technicians:', error);
        res.status(500).json({ error: 'An error occurred while fetching technicians.' });
    }
};


const getTechnicianById = async (req, res) => {
    const { technicianId } = req.params; // Extracting the technicianId from route parameters

    // Check if technicianId is provided
    if (!technicianId) {
        return res.status(400).json({ message: 'TechnicianId parameter is required.' });
    }

    try {
        // Find the technician by their ID
        const technician = await Technician.findOne({
            where: { id: technicianId },
            include: [
                {
                    model: Condominium,
                    as: 'condominiumTech', 
                    attributes: ['id', 'name']
                },
                {
                    model: PrefCommunication,
                    as: 'prefCommunication',
                    attributes: ['id', 'name']
                }
            ]
        });

        // If no technician is found, return a 404 status with a descriptive message
        if (!technician) {
            return res.status(404).json({ message: `No technician found with ID: ${technicianId}.` });
        }

        // Return the technician's details
        return res.status(200).json(technician);
    } catch (error) {
        console.error('Error fetching technician by technicianId:', error);
        // Return a 500 status in case of an internal server error
        return res.status(500).json({ error: 'An error occurred while fetching the technician.' });
    }
};

module.exports = {
    getTechniciansByCondominiumId,
    getAllTechnicians,
    getTechnicianById
};
