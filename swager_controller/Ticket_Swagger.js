const Ticket = require('../models/Ticket'); // Adjust the path as necessary

const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            order: [['createdAt', 'DESC']], // Order by createdAt in descending order
        });
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tickets', error });
    }
};

const createTicket = async (req, res) => {
    const { username, user_condominium, user_email, user_phone, isUrgent, ProblemStatement } = req.body;

    try {
        const newTicket = await Ticket.create({
            username,
            user_condominium,
            user_email,
            user_phone,
            isUrgent,
            ProblemStatement,
        });
        res.status(201).json(newTicket);
    } catch (error) {
        res.status(400).json({ message: 'Error creating ticket', error });
    }
};

// Fetch a ticket by ID
const getTicketById = async (req, res) => {
    const { id } = req.params;

    try {
        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ticket', error });
    }
};

// Update a ticket
const updateTicket = async (req, res) => {
    const { id } = req.params;
    const { username, user_condominium, user_email, user_phone, technician_name, isUrgent, ProblemStatement } = req.body;

    try {
        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        await ticket.update({
            username,
            user_condominium,
            user_email,
            user_phone,
            technician_name,
            isUrgent,
            ProblemStatement,
        });

        res.status(200).json(ticket);
    } catch (error) {
        res.status(400).json({ message: 'Error updating ticket', error });
    }
};

// Delete a ticket
const deleteTicket = async (req, res) => {
    const { id } = req.params;

    try {
        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        await ticket.destroy();
        res.status(204).json(); // No content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting ticket', error });
    }
};

const assignTechnician = async (req, res) => {
    const { id } = req.params;
    const { technician_name } = req.body;

    try {
        const ticket = await Ticket.findByPk(id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.technician_name = technician_name;
        await ticket.save();

        res.status(200).json(ticket);
    } catch (error) {
        res.status(400).json({ message: 'Error assigning technician', error });
    }
};

module.exports = {
    getAllTickets,
    createTicket,
    getTicketById,
    updateTicket,
    deleteTicket,
    assignTechnician,
};
