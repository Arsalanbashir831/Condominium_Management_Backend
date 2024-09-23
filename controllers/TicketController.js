const Ticket = require("../models/Ticket");
const User = require("../models/Users");
const Technician = require("../models/Technician");
const Condominium = require("../models/Condominium");
const PrefCommunication = require("../models/PrefCommunication");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodemailer = require("nodemailer");
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// client.messages
//     .create({
//         body: 'Your appointment is coming up on July 21 at 3PM',
//         from: 'whatsapp:+14155238886',
//         to: 'whatsapp:+923071257828'
//     })
//     .then(message => console.log(message.sid))
//     .done();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_APP_NAME,
    pass: process.env.GMAIL_APP_PASS,
  },
});

async function getUserById(userId) {
  try {
    const user = await User.findOne({
      where: { id: userId },
      attributes: [
        "id",
        "email",
        "name",
        "surname",
        "apartment",
        "contactNumber",
        "createdAt",
      ],
      include: [
        {
          model: Condominium,
          as: "condominium",
          attributes: ["name"],
        },
      ],
    });

    if (!user) {
      return { error: "User not found" };
    }
    return {
      ...user.dataValues,
      condominium: user.dataValues.condominium.dataValues.name,
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: "An error occurred while fetching user details" };
  }
}

const getTechniciansByCondominiumId = async (condominiumId) => {
  console.log("get technician function ", condominiumId);

  if (!condominiumId) {
    throw new Error("CondominiumId is required.");
  }

  try {
    const technicians = await Technician.findAll({
      where: { CondominiumId: condominiumId },
      include: [
        {
          model: Condominium,
          as: "condominiumTech",
          attributes: ["id", "name"],
        },
        {
          model: PrefCommunication,
          as: "prefCommunication",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!technicians.length) {
      throw new Error("No technicians found for this condominium.");
    }

    return technicians.map((technician) => technician.dataValues);
  } catch (error) {
    console.error("Error fetching technicians by condominiumId:", error);
    throw new Error("An error occurred while fetching technicians.");
  }
};

const selectBestTechnician = async (problemStatement, condominiumId) => {
  console.log("Selecting best technician for condominium:", condominiumId);

  const technicianData = await getTechniciansByCondominiumId(condominiumId);
  const prompt = `
      You are an AI assistant for a condominium manager. Based on the following problem statement: "${problemStatement}", 
      evaluate the list of technicians provided and determine which technician would be the most suitable to address this issue. 
      Provide only the technician's ID,Company Name, email, and contact number in your response, formatted as JSON.

      Here are the technicians:
      ${JSON.stringify(technicianData)}
  `;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    let responseText = result.response.text().trim();
    console.log("Raw AI response:", responseText); // Log the raw response
    responseText = responseText.replace(/```json|```/g, "").trim(); // Remove the backticks
    const technicianResponse = JSON.parse(responseText);
    return {
      id: technicianResponse.id,
      email: technicianResponse.email,
      contactNumber: technicianResponse.ContactNumber || "Not provided",
      CompanyName: technicianData[0].CompanyName || "Not provided",
    };
  } catch (error) {
    console.error("Error selecting best technician:", error);

    if (technicianData.length > 0) {
      return {
        id: technicianData[0].id,
        email: technicianData[0].email,
        contactNumber: technicianData[0].contactNumber || "Not provided",
        CompanyName: technicianData[0].CompanyName || "Not provided",
      };
    } else {
      return {
        id: 27,
        email: "info@vetri-finestre.it",
        contactNumber: "+39 333 9012346",
      };
    }
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["CondominiumId"] },
          include: [
            {
              model: Condominium,
              as: "condominium",
              attributes: ["name"],
            },
          ],
        },
        {
          model: Technician,
          as: "assigned_technicians",
          attributes: { exclude: ["PrefferedCommunication", "CondominiumId"] },

          include: [
            {
              model: Condominium,
              as: "condominiumTech",
              attributes: ["name"],
            },
            {
              model: PrefCommunication,
              as: "prefCommunication",
              attributes: ["name"],
            },
          ],
        },
      ],
      attributes: { exclude: ["TechnicianId", "createdAt", "userId"] },
    });
    res.json(tickets);
  } catch (error) {
    console.error("Error retrieving tickets:", error);
    res
      .status(500)
      .json({ message: "An error occurred while retrieving tickets." });
  }
};

const createTicket = async (req, res) => {
  const { userId, priority, ProblemStatement, condominiumId } = req.body;
  const user = await getUserById(userId);

  const { id, email, contactNumber, CompanyName } = await selectBestTechnician(
    ProblemStatement,
    condominiumId
  );
  console.log(id, email, contactNumber);

  try {
    const ticket = await Ticket.create({
      userId,
      priority,
      ProblemStatement,
      technicianId: id,
    });

    const mailOptions = {
      from: process.env.GMAIL_APP_NAME,
      to: email,
      subject: "Assistance Required: At Condominium " + user.condominium,
      text: `
  Dear ${CompanyName},
  
  I hope this message finds you well.
  We are facing problem of ${ProblemStatement} at condominium ${user.condominium}
  these are the user details please contact them
  Name : ${user.name}
  Email : ${user.email}
  Contact Number : ${user.contactNumber}
  Apartment  : ${user.apartment}
  We appreciate your prompt attention to this matter and look forward to your swift response. 
  Thank you for your cooperation.
  
  Best regards,
Condominium Manager
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent to technician:", email);

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket or sending email:", error);
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
    res.status(500).json({
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
