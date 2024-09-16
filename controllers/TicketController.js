
const Ticket = require("../models/Ticket");
const User = require("../models/Users");
const Technician = require("../models/Technician");
const Condominium = require("../models/Condominium");
const PrefCommunication = require("../models/PrefCommunication");

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes:{exclude:['CondominiumId']},
          include: [
            {
              model: Condominium,
              as: 'condominium', 
              attributes: ['name'], 
            },
          ],
        },
        {
          model: Technician,
          as: 'assigned_technicians',
          attributes:{exclude:['PrefferedCommunication','CondominiumId']},
          
          include: [
            {
              model: Condominium,
              as: 'condominiumTech', 
              attributes: ['name'],
            },
            {
              model: PrefCommunication,
              as: 'prefCommunication', 
              attributes: ['name'], 
            },
          ],
        },
      ],
      attributes: { exclude: ['TechnicianId','createdAt','userId'] },
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error retrieving tickets:', error);
    res.status(500).json({ message: 'An error occurred while retrieving tickets.' });
  }
};

const createTicket = async (req, res) => {
  const { userId, isUrgent, ProblemStatement } = req.body;
  try {
    const ticket = await Ticket.create({
      userId,
      isUrgent,
      ProblemStatement,
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the ticket." });
  }
};

const updateTicket = async (req, res) => {
  const { ticketId } = req.params;
  const updates = req.body;

  try {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    await ticket.update(updates);
    res.json({ message: "Ticket updated successfully.", ticket });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the ticket." });
  }
};

const deleteTicket = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }

    await ticket.destroy();
    res.json({ message: "Ticket deleted successfully." });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the ticket." });
  }
};

const assignTechnicianToTicket = async (req, res) => {
  const { TechnicianId, ticketId } = req.body;
console.log(TechnicianId, ticketId);

  try {
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }
    const technician = await Technician.findByPk(TechnicianId);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found." });
    }


    ticket.TechnicianId = TechnicianId;
    await ticket.save();

    res.json({ message: "Technician assigned successfully.", ticket });
  } catch (error) {
    console.error("Error assigning technician to ticket:", error);
    res
      .status(500)
      .json({
        message: "An error occurred while assigning technician to ticket.",
      });
  }
};

module.exports = {
  getAllTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  assignTechnicianToTicket,
};
