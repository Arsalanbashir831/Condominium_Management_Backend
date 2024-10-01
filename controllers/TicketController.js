const Ticket = require("../models/Ticket");
const User = require("../models/Users");
const Technician = require("../models/Technician");
const Condominium = require("../models/Condominium");
const PrefCommunication = require("../models/PrefCommunication");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodemailer = require("nodemailer");
const Status = require("../models/Status");
const { Op } = require("sequelize");
// const accountSid = process.env.TWILIO_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);
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

const getTechnicianById = async (technicianId) => {
  if (!technicianId) {
    console.log("technician id required");
  }
  try {
    // Find the technician by their ID
    const technician = await Technician.findOne({
      where: { id: technicianId },
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

    // If no technician is found, return a 404 status with a descriptive message
    if (!technician) {
      console.log("No technician found");
    }

    // Return the technician's details
    return { ...technician.dataValues };
  } catch (error) {
    console.error("Error fetching technician by technicianId:", error);
    // Return a 500 status in case of an internal server error
  }
};

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
    // Get query parameters
    const { isArchieve } = req.query;

    // Build the filtering conditions
    const whereConditions = {};
    if (isArchieve !== undefined) {
      whereConditions.isArchieve = isArchieve === "true"; // Convert query param to boolean
    }

    // Fetch tickets with optional filtering by 'isArchieve'
    const tickets = await Ticket.findAll({
      where: whereConditions, // Apply the filtering conditions
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
              attributes: ["name", "id"],
            },
          ],
        },
        {
          model: Status,
          as: "status",
          attributes: ["name", "id"],
        },
        {
          model: Technician,
          as: "assigned_technicians",
          attributes: { exclude: ["PrefferedCommunication", "CondominiumId"] },
          include: [
            {
              model: Condominium,
              as: "condominiumTech",
              attributes: ["name", "id"],
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
  const {
    userId,
    priority,
    ProblemStatement,
    condominiumId,
    IsPermitToAutoMail,
  } = req.body;

  const user = await getUserById(userId);
  const { id, email, contactNumber, CompanyName } = await selectBestTechnician(
    ProblemStatement,
    condominiumId
  );

  try {
    // Create the ticket
    const ticket = await Ticket.create({
      userId,
      priority,
      ProblemStatement,
      technicianId: id, // Use the selected technician ID
      statusId: 1,
      IsPermitToAutoMail,
    });

    // Only send email if IsPermitToAutoMail is true
    if (IsPermitToAutoMail) {
      const approveUrl = `${process.env.FRONTEND_URL}/tickets/${ticket.id}/2`;
      const rejectUrl = `${process.env.FRONTEND_URL}/tickets/${ticket.id}/3`;

      const mailOptions = {
        from: process.env.GMAIL_APP_NAME,
        to: email,
        subject: "Assistance Required: At Condominium " + user.condominium,
        html: `
          <p>Dear <strong>${CompanyName}</strong>,</p>
          <p>We are facing the problem of <strong>${ProblemStatement}</strong> at condominium <strong>${user.condominium}</strong>.</p>
          <p>Here are the user details, please contact them:</p>
          <ul>
            <li>Name: ${user.name}</li>
            <li>Email: ${user.email}</li>
            <li>Contact Number: ${user.contactNumber}</li>
            <li>Apartment: ${user.apartment}</li>
          </ul>
          <p>Please approve or reject this ticket:</p>
          <p>
            <a href="${approveUrl}" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">Approve</a>
            <a href="${rejectUrl}" style="padding: 10px 20px; background-color: red; color: white; text-decoration: none; border-radius: 5px;">Reject</a>
          </p>
          <p>Best regards,<br>Condominium Manager</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent to technician:", email);
    } else {
      console.log("Email permission not granted, skipping email.");
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket or sending email:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the ticket." });
  }
};

const manualcreateTicket = async (req, res) => {
  const {
    userId,
    priority,
    ProblemStatement,
    IsPermitToAutoMail,
    technicianId,
  } = req.body;

  const user = await getUserById(userId);
  const { email, CompanyName } = await getTechnicianById(technicianId);

  try {
    // Create the ticket
    const ticket = await Ticket.create({
      userId,
      priority,
      ProblemStatement,
      technicianId, // Use the selected technician ID
      statusId: 1,
      IsPermitToAutoMail,
    });

    // Only send email if IsPermitToAutoMail is true
    if (IsPermitToAutoMail) {
      const approveUrl = `${process.env.FRONTEND_URL}/tickets/${ticket.id}/2`;
      const rejectUrl = `${process.env.FRONTEND_URL}/tickets/${ticket.id}/3`;

      const mailOptions = {
        from: process.env.GMAIL_APP_NAME,
        to: email,
        subject: `Richiesta assistenza At Condominium  ${user.condominium}`,
        html: `
        <p><strong>${CompanyName}</strong>,</p>
        <p>Abbiamo riscontrato il seguente problema: <strong>${ProblemStatement}</strong> al condominio <strong>${user.condominium}</strong>.</p>
        <p>Questi sono i dati del condomino, perfavore contatta:</p>
        <ul>
          <li>Nome: ${user.name}</li>
          <li>Email: ${user.email}</li>
          <li> Numero: ${user.contactNumber}</li>
          <li>Appartamento: ${user.apartment}</li>
        </ul>
        <p>Per favore accetta o rifiuta questa richiesta:</p>
        <p>
          <a href="${approveUrl}" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">Accetta</a>
          <a href="${rejectUrl}" style="padding: 10px 20px; background-color: red; color: white; text-decoration: none; border-radius: 5px;">Rifiuta</a>
        </p>
       
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent to technician:", email);
    } else {
      console.log("Email permission not granted, skipping email.");
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket or sending email:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the ticket." });
  }
};

const rejectionMail = async (req, res) => {
  const { ticketId } = req.params;


  try {
    const ticket = await Ticket.findOne({
      where: { id: ticketId },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["CondominiumId"] },
          include: [
            {
              model: Condominium,
              as: "condominium",
              attributes: ["name", "id"],
            },
          ],
        },
        {
          model: Status,
          as: "status",
          attributes: ["name", "id"],
        },
        {
          model: Technician,
          as: "assigned_technicians",
          attributes: { exclude: ["PrefferedCommunication", "CondominiumId"] },
          include: [
            {
              model: Condominium,
              as: "condominiumTech",
              attributes: ["name", "id"],
            },
            {
              model: PrefCommunication,
              as: "prefCommunication",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    // Destructure necessary details from the ticket

    await ticket.update({ statusId: 3 });
    const { priority, ProblemStatement } = ticket;
    const user = ticket.dataValues.user.dataValues; // Access user details
    const technician = ticket.dataValues.assigned_technicians.dataValues;

    // Create mail content
    const mailContent = `
    <h1 style="color: #333;">Ticket ID ${ticket.dataValues.id} è stato rifiutato dal tecnico.</h1>
    
    <p style="font-size: 16px; color: #555;">Dettagli del ticket:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Nome</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${user.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${user.email}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Numero</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${user.contactNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Appartamento</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${user.apartment}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Condominio</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${user.condominium.dataValues.name}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tecnico</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${technician.CompanyName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Problema</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${ProblemStatement}</td>
      </tr>
    </table>
    
    <p style="font-size: 16px; color: #555;">Se hai domande, non esitare a contattarci.</p>
  `;
  

    // Set mail options
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: user.email, // Send to the user's email
      subject: `Ticket n.${ticket.id} rifiutato `,
      html: mailContent,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return success response
    res.status(200).json({ message: "Rejection email sent successfully" });
  } catch (error) {
    console.error("Error sending rejection email:", error);
    res.status(500).json({ message: "Failed to send rejection email", error });
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

const updateTicketStatus = async (req, res) => {
  const { ticketId } = req.params;
  const { statusId } = req.body;

  try {
    console.log(ticketId, statusId);
    // Validate if the ticket exists
    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: User,
          as: "user", // Ensure that this alias matches your model association
          attributes: { exclude: ["CondominiumId"] },
          include: [
            {
              model: Condominium,
              as: "condominium", // Ensure that this alias matches your model association
              attributes: ["name"],
            },
          ],
        },
        {
          model: Status,
          as: "status", // Ensure that this alias matches your model association
          attributes: ["name"],
        },
        {
          model: Technician,
          as: "assigned_technicians", // Ensure that this alias matches your model association
          attributes: { exclude: ["PrefferedCommunication", "CondominiumId"] },
          include: [
            {
              model: Condominium,
              as: "condominiumTech", // Ensure that this alias matches your model association
              attributes: ["name"],
            },
            {
              model: PrefCommunication,
              as: "prefCommunication", // Ensure that this alias matches your model association
              attributes: ["name"],
            },
          ],
        },
      ],
      attributes: { exclude: ["TechnicianId", "createdAt", "userId"] },
    });

    // console.log(ticket)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if the provided status ID is valid
    const status = await Status.findByPk(statusId);
    if (!status) {
      return res.status(400).json({ message: "Invalid status ID" });
    }

    // Update the ticket's status
    ticket.statusId = statusId;
    await ticket.save();

    // Check if status is 3, and send an email to admin
    if (statusId === "3") {
      const mailOptions = {
        from: process.env.GMAIL_APP_NAME,
        to: ticket.dataValues.user.dataValues.email,
        subject: "Il tecnico non ha confermato la richiesta",
        html: `
            <p>Ciao,</p>
            <p>Ticket ID <strong>${ticket.dataValues.id}</strong> Dopo la seconda richiesta, il tecnico non ha ancora confermato la richiesta.</p>
            <p>Dettagli:</p>
            <ul>
              <li>Nome: ${ticket.dataValues.user.dataValues.name}</li>
              <li>Email: ${ticket.dataValues.user.dataValues.email}</li>
              <li>Numer: ${ticket.dataValues.user.dataValues.contactNumber}</li>
              <li>Appartamento: ${ticket.dataValues.user.dataValues.apartment}</li>
              <li>Condominio: ${ticket.dataValues.user.dataValues.condominium.dataValues.name}</li>
              <li>Tecnico: ${ticket.dataValues.assigned_technicians.dataValues.CompanyName}</li>
              <li>Problema: ${ticket.dataValues.ProblemStatement}</li>
              <li>Numero di Follow-up ${ticket.dataValues.followUpCount}</li>
            </ul>

          `,
      };

      await transporter.sendMail(mailOptions).then(() => {
        console.log("mail sended");
      });
    }

    return res
      .status(200)
      .json({ message: "Ticket status updated successfully", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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

const getTicketsAndSendEmail = async (req, res) => {
  try {
    // Calculate the date for tickets older than one day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getSeconds() - 6); // Subtract one day

    // Fetch tickets with the necessary conditions
    const tickets = await Ticket.findAll({
      where: {
        statusId: 1,
        isArchieve: false,
        IsPermitToAutoMail: true,
        //  createdAt: { [Op.lt]: oneDayAgo } ,
        followUpCount: 0,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "contactNumber", "apartment"],
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
          attributes: ["CompanyName", "SectorName", "email"],
        },
        {
          model: Status,
          as: "status",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!tickets.length) {
      return res
        .status(404)
        .json({
          message:
            "No tickets found older than one day with status 1 and matching conditions",
        });
    }

    const emailPromises = tickets.map(async (ticket) => {
      const approveUrl = `${process.env.FRONTEND_URL}/tickets/${ticket.id}/2`;
      const rejectUrl = `${process.env.FRONTEND_URL}/tickets/${ticket.id}/3`;

      // Increment follow-up count
      ticket.followUpCount += 1;
      await ticket.save(); // Save the ticket with updated follow-up count

      const user = ticket.user;
      const technician = ticket.assigned_technicians.dataValues;
      console.log(ticket);

      const mailOptions = {
        from: process.env.GMAIL_APP_NAME,
        to: technician.email, // Use user's email
        subject: `Ticket n.${ticket.id} in sospeso: it tecnico non ha risposto  `,
        html: `
        <h1> Urgente richiesta in sospeso</h1>
  <p> ${technician.CompanyName},</p>
  
  <p> Hai una richiesta in sospeso per il seguente condominio: <strong>Condominium ${user.condominium.name}</strong></p>

  <p><strong>Problema:</strong> ${ticket.ProblemStatement}</p>
  <p><strong>User name</strong> ${user.name}</p>
  
  <p> Questa richiesta è ancora in sospeso nei nostri sistemi, ti invitiamo a visitare il condominio il prima possibile.</p>
  
  <p>Se hai bisogno di ulteriori informazioni e assistenza, non esitare a contattarci.</p>
            <a href="${approveUrl}" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">Accetta</a>
             <a href="${rejectUrl}" style="padding: 10px 20px; background-color: red; color: white; text-decoration: none; border-radius: 5px;">Rifiuta</a>
 
             
    <p style="font-size: 16px; color: #555;">Ciao,</p>
    <p style="font-size: 16px; color: #555;">Il Team del Supporto</p>
      `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    return res.status(200).json({
      message: "Follow-up emails sent and follow-up counts updated.",
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        followUpCount: ticket.followUpCount,
        statusId: ticket.statusId,
        technicianId: ticket.technicianId,
        priority: ticket.priority,
        ProblemStatement: ticket.ProblemStatement,
        createdAt: ticket.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getTicketsAndNotifyAdmin = async (req, res) => {
  try {
    // Find all tickets with statusId = 1 (assuming '1' corresponds to 'pending')
    const tickets = await Ticket.findAll({
      where: {
        statusId: 1,
        isArchieve: false,
        IsPermitToAutoMail: true,
        followUpCount: 1,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "contactNumber", "apartment"],
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
          attributes: ["CompanyName"],
        },
        {
          model: Status,
          as: "status",
          attributes: ["id", "name"], // Assuming you're using 'name' in Status model
        },
      ],
    });

    // If no tickets found
    if (!tickets.length) {
      return res
        .status(404)
        .json({ message: "No tickets found with status pending" });
    }

    // Loop through tickets to notify admin
    for (const ticket of tickets) {
      const adminMailOptions = {
        from: process.env.GMAIL_APP_NAME,
        to: process.env.ADMIN_EMAIL,
        subject: `Ticket n.${ticket.dataValues.id} in sospeso: it tecnico non ha risposto `,
        html: `
            <p>Ciao,</p>
            <p>Ticket ID <strong>${ticket.dataValues.id}</strong> Dopo la seconda richiesta, il tecnico non ha ancora confermato la richiesta.</p>
            <p>Dettagli:</p>
            <ul>
              <li>Nome: ${ticket.dataValues.user.dataValues.name}</li>
              <li>Email: ${ticket.dataValues.user.dataValues.email}</li>
              <li>Numer: ${ticket.dataValues.user.dataValues.contactNumber}</li>
              <li>Appartamento: ${ticket.dataValues.user.dataValues.apartment}</li>
              <li>Condominio: ${ticket.dataValues.user.dataValues.condominium.dataValues.name}</li>
              <li>Tecnico: ${ticket.dataValues.assigned_technicians.dataValues.CompanyName}</li>
              <li>Problema: ${ticket.dataValues.ProblemStatement}</li>
              <li>Numero di Follow-up ${ticket.dataValues.followUpCount}</li>
            </ul>
             `,
      };

      // Send email to admin
      await transporter
        .sendMail(adminMailOptions)
        .then(async () => {
          console.log("Notification sent to admin");
          // Update followUpCount to 2 after the email is sent
        })
        .catch((error) => {
          console.error("Error sending email:", error);
        });
    }

    return res.status(200).json({
      message:
        "Admin notified for tickets with pending technician replies, and ticket follow-up counts updated.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  getAllTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  assignTechnicianToTicket,
  updateTicketStatus,
  getTicketsAndSendEmail,
  getTicketsAndNotifyAdmin,
  manualcreateTicket,
  rejectionMail,
};
