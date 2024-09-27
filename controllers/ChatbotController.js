const { OpenAI } = require("openai");
const translate = require("translate-google"); // Import translate-google
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodemailer = require("nodemailer");
const Condominium = require("../models/Condominium");
const Technician = require("../models/Technician");
const { Ticket, User } = require("../models/Assosiation");
const PrefCommunication = require("../models/PrefCommunication");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API,
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_APP_NAME,
    pass: process.env.GMAIL_APP_PASS,
  },
});
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

const createTicket = async (userId, priority, ProblemStatement, condominiumId, IsPermitToAutoMail) => {  
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
      IsPermitToAutoMail
    });

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
console.log('Ticked created ');
    return ticket
  } catch (error) {
    console.error("Error creating ticket or sending email:", error);
    // res.status(500).json({ message: "An error occurred while creating the ticket." });
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





const classifyProblem = async (problemStatement) => {
  const prompt = `Classifica la seguente descrizione del problema in una di queste categorie: idraulico, elettricista o tecnico. Descrizione del problema: "${problemStatement}". Menziona solo il nome della categoria, senza bisogno di giustificazione.`;
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4", // You can use gpt-4 or gpt-3.5-turbo depending on your setup
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error("Error classifying problem:", error);
    return "tecnico";
  }
};

const classifyPriority = async (problemStatement) => {
  const prompt = `
        Based on the following problem statement, classify it into one of these categories: urgent, fairly urgent, non-urgent.
        Problem statement: "${problemStatement}".
        and on the creteria to decide on which you have to train and give result
         Urgent Requests:

1. Major water leak in my apartment damaging the ceiling.
2. ⁠Elevator stuck with people inside.
3. ⁠Short circuit causing a blackout in the building.
4. ⁠Broken lock on the main entrance, we can’t enter or leave.
5. ⁠Fire in a common area (e.g., basement, garage).
6. ⁠Water infiltration in the garage that may cause immediate damage.
7. ⁠Suspected gas leak, I smell strong gas throughout the building.
8. ⁠Rodent or insect infestation visible in common areas.
9. ⁠Complete heating system failure in the middle of winter.
10. ⁠Flooding in the basement due to a broken pipe.

Fairly Urgent Requests:

1. Elevator malfunction, no one is trapped but it hasn't worked for a day.
2. ⁠Power outage in the common areas of the building.
3. ⁠Small water leak in the shared garden.Garage door not opening properly.
4. ⁠Loud and constant noise coming from an apartment, disturbing neighbors.
5. ⁠Insufficient heating in the apartments.
6. ⁠Lighting in the stairwell not working.
7. ⁠Broken glass on the main entrance door.
8. ⁠Slight water leak from the roof during rain.
9. ⁠Persistent mold smell in the shared basements.

Non-Urgent Requests:

1. Request for information about the date of the next condo meeting.
2. ⁠Request for a copy of the condominium rules.
3. ⁠Request to install a bike rack in the common areas.
4. ⁠Request to change the timing of the courtyard’s automatic lights.
5. ⁠Proposal to repaint the walls of the common stairwells.
6. ⁠Report of a small scratch on a car in the condo parking lot.
7. ⁠Request for tree trimming in the shared garden.
8. ⁠Question about when the elevator’s regular maintenance is scheduled.
9. ⁠Request for information on upcoming condo fees.
10. ⁠Request to replace a light bulb in one of the parking lights.
        
        Just return the urgency level (urgent, fairly urgent, or non-urgent).
        dont give me explaination just say urgent , not urgent and fairly urgent thats it
    `;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4", // You can use gpt-4 or gpt-3.5-turbo depending on your setup
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error("Error classifying priority:", error);
    return "non-urgent";
  }
};

const generateTagline = async (problemStatement) => {
  const prompt = `Creami una dichiarazione in una riga per il seguente problema: "${problemStatement}". Rendilo super semplificato in una sola riga senza alcuna decorazione di testo o nuove righe. Traducilo in italiano e fornisci solo uno slogan senza dare dettagli, rendilo pertinente e diretto al punto.`;


  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error("Error generating tagline:", error);
    return "No tagline available.";
  }
};

const generateInitialResponse = async (technicianType,username) => {

    return `ok ${username}, grazie per la tua segnalazione. Abbiamo già avvisato il ${technicianType} e arriverà il prima possibile.`

};


const aiproblemSolver = async ({ userId, problemStatement, username , condominiumId }) => {
  try {
    if (!userId || !problemStatement || !username) {
      throw new Error("UserId, problemStatement, and username are required.");
    }

    const technicianType = await classifyProblem(problemStatement);
    const tagline = await generateTagline(problemStatement);
    const priority = await classifyPriority(problemStatement);
    const initialResponse = await generateInitialResponse(technicianType, username);
   await createTicket(userId, priority, problemStatement, condominiumId, true)
    return {
      response: initialResponse,
      tagline,
      priority,
      hasNextQuestion: false,
    };
  } catch (error) {
    console.error("Error handling chatbot interaction:", error);
    throw new Error("Error handling chatbot interaction: " + error.message);
  }
};

const simpleSupportChat = async (req, res) => {
  const { problemStatement,userId, username , condominiumId} = req.params;

  try {
    // Convert the user input to lowercase for case-insensitive matching
    const lowerInput = problemStatement.toLowerCase();

    // Define keywords indicating appreciation
    const appreciationKeywords = [
      "thanks", "thank you", "thank", "grazie", "appreciate", "apprezzo",
      "thanks a lot", "much appreciated", "thank you very much",
      "mille grazie", "ti ringrazio", "grazie mille", "ringrazio",
      "sono grato", "sono riconoscente", "grazie tante", "grazie per tutto"
    ];

    // Check if the user input contains any appreciation keywords
    const isAppreciation = appreciationKeywords.some(keyword => lowerInput.includes(keyword));

    if (isAppreciation) {
      const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "assistant",
           content: `Devi capire la risposta dell'utente e lo hai già aiutato. Ora l'utente è felice e sta dicendo: ${problemStatement}. Gestisci la risposta dell'utente a modo tuo in una frase, come se l'utente dicesse: ${problemStatement}, rispondi "Siamo sempre qui per te. È un piacere." Accettalo come un ringraziamento, e rispondi che siamo sempre pronti ad assisterti.`

          }
        ],
      });

      // Get the response content
      const chatResponse = response.choices[0].message.content.trim();

      // Send the response back to the user
      res.status(200).json({ response: chatResponse, isProblem:false });
    } else {
      // Pass the parameters as an object to aiproblemSolver
      const { response, tagline, priority, hasNextQuestion } = await aiproblemSolver({ userId, problemStatement, username , condominiumId });

      res.status(200).json({
        response,
        tagline,
        priority,
        hasNextQuestion,
        isProblem:true
      });
    }
  } catch (error) {
    console.error("Error generating chatbot response:", error);

    // Fallback response in case of an error
    res.status(500).json({
      message: "We apologize for the inconvenience. An error occurred while processing your request. Please try again later or contact our support team.",
    });
  }
};




// The simplified geminiChat endpoint
const geminiChat = async (req, res) => {
  try {
    const { userId, problemStatement, username } = req.body;

    if (!userId || !problemStatement || !username) {
      return res.status(400).json({ message: "UserId, problemStatement, and username are required." });
    }
    const technicianType = await classifyProblem(problemStatement);
    const tagline = await generateTagline(problemStatement);
    const priority = await classifyPriority(problemStatement);
    const initialResponse = await generateInitialResponse( technicianType,username);
    return res.json({
      response: initialResponse,
      tagline,
     priority,
     hasNextQuestion: false,
    });
  } catch (error) {
    console.error("Error handling chatbot interaction:", error);
    res.status(500).json({
      message: "Error handling chatbot interaction",
      error: error.message,
    });
  }
};

module.exports = {geminiChat, simpleSupportChat};
