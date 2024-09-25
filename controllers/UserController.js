const Condominium = require('../models/Condominium');
const User = require('../models/Users'); 
const { Op } = require('sequelize');
const { ValidationError } = require('sequelize'); 


const getUserByContact = async (req, res) => {
    const { query } = req.params; 
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: query },
                    { contactNumber: query } 
                ]
            },
            include: { model: Condominium, as: 'condominium' },
            attributes: { exclude: ['CondominiumId'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user by contact:', error);
        res.status(500).json({ error: 'An error occurred while fetching the user.' });
    }
};

    

const addUser = async (req, res) => {
    const { email, name, surname, apartment, CondominiumId, contactNumber } = req.body;

    if (!email || !name || !surname || !apartment || !CondominiumId || !contactNumber) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {

        const newUser = await User.create({
            email,
            name,
            surname,
            apartment,
            CondominiumId,
            contactNumber,
        });

        res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error) {
        if (error instanceof ValidationError) {
            
            res.status(400).json({ message: 'Validation error.', errors: error.errors });
        } else {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'An error occurred while creating the user.' });
        }
    }
};

const fetchAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: { model: Condominium, as: 'condominium' },
            attributes: { exclude: ['CondominiumId'] }
        });

        if (!users.length) {
            return res.status(404).json({ message: 'No users found.' });
        }

        res.json(users);
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
};



const editUser = async (req, res) => {
    const { userId } = req.params; // Assuming you're passing user ID as a URL parameter
    const { email, name, surname, apartment, CondominiumId, contactNumber } = req.body;

    try {
        // Find the user by ID
        const user = await User.findByPk(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Create an object to hold the updated fields
        const updatedFields = {};

        // Check which fields are provided and add them to the updatedFields object
        if (email) updatedFields.email = email;
        if (name) updatedFields.name = name;
        if (surname) updatedFields.surname = surname;
        if (apartment) updatedFields.apartment = apartment;
        if (CondominiumId) updatedFields.CondominiumId = CondominiumId;
        if (contactNumber) updatedFields.contactNumber = contactNumber;

        await user.update(updatedFields);

        res.json({ message: 'User updated successfully.', user });
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ message: 'Validation error.', errors: error.errors });
        } else {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'An error occurred while updating the user.' });
        }
    }
};

module.exports = {
    getUserByContact,
    addUser , fetchAllUsers , editUser
};
