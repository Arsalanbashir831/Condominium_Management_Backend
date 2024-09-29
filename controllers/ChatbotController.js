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
          <a href="${approveUrl}" style="padding: 10px 20px; background-color: green; color: white; text-decoration: none; border-radius: 5px;">Approve</a>
          <a href="${rejectUrl}" style="padding: 10px 20px; background-color: red; color: white; text-decoration: none; border-radius: 5px;">Reject</a>
        </p>
        <p>Grazie,<br>Condominium Manager</p>
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
  
    const prompt = `Classifica la seguente descrizione del problema in una di queste categorie: idraulico, elettricista o tecnico. Descrizione del problema: "${problemStatement}". Menziona solo il nome della categoria, senza bisogno di giustificazione. Se la descrizione è vaga o simile, scegli "tecnico".`;


    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim().toLowerCase();
    } catch (error) {
        console.error('Error classifying problem:', error);
        return 'tecnico'; 
    }
};
// const classifyProblem = async (problemStatement) => {

//   const prompt = `Classifica la seguente descrizione del problema in una di queste categorie: idraulico, elettricista o tecnico. Descrizione del problema: "${problemStatement}". Menziona solo il nome della categoria, senza bisogno di giustificazione. Se la descrizione è vaga o simile, scegli "tecnico".`;


//   try {
//     const response = await client.chat.completions.create({
//       model: "gpt-4", // You can use gpt-4 or gpt-3.5-turbo depending on your setup
//       messages: [{ role: "user", content: prompt }],
//     });
//     return response.choices[0].message.content.trim().toLowerCase();
//   } catch (error) {
//     console.error("Error classifying problem:", error);
//     return "tecnico";
//   }
// };

// const classifyPriority = async (problemStatement) => {
//   const prompt = `
//         Based on the following problem statement, classify it into one of these categories: urgent, fairly urgent, non-urgent.
//         Problem statement: "${problemStatement}".
//         and on the creteria to decide on which you have to train and give result
//          Urgent Requests:

// 1. Major water leak in my apartment damaging the ceiling.
// 2. ⁠Elevator stuck with people inside.
// 3. ⁠Short circuit causing a blackout in the building.
// 4. ⁠Broken lock on the main entrance, we can’t enter or leave.
// 5. ⁠Fire in a common area (e.g., basement, garage).
// 6. ⁠Water infiltration in the garage that may cause immediate damage.
// 7. ⁠Suspected gas leak, I smell strong gas throughout the building.
// 8. ⁠Rodent or insect infestation visible in common areas.
// 9. ⁠Complete heating system failure in the middle of winter.
// 10. ⁠Flooding in the basement due to a broken pipe.

// Fairly Urgent Requests:

// 1. Elevator malfunction, no one is trapped but it hasn't worked for a day.
// 2. ⁠Power outage in the common areas of the building.
// 3. ⁠Small water leak in the shared garden.Garage door not opening properly.
// 4. ⁠Loud and constant noise coming from an apartment, disturbing neighbors.
// 5. ⁠Insufficient heating in the apartments.
// 6. ⁠Lighting in the stairwell not working.
// 7. ⁠Broken glass on the main entrance door.
// 8. ⁠Slight water leak from the roof during rain.
// 9. ⁠Persistent mold smell in the shared basements.

// Non-Urgent Requests:

// 1. Request for information about the date of the next condo meeting.
// 2. ⁠Request for a copy of the condominium rules.
// 3. ⁠Request to install a bike rack in the common areas.
// 4. ⁠Request to change the timing of the courtyard’s automatic lights.
// 5. ⁠Proposal to repaint the walls of the common stairwells.
// 6. ⁠Report of a small scratch on a car in the condo parking lot.
// 7. ⁠Request for tree trimming in the shared garden.
// 8. ⁠Question about when the elevator’s regular maintenance is scheduled.
// 9. ⁠Request for information on upcoming condo fees.
// 10. ⁠Request to replace a light bulb in one of the parking lights.
        
//         Just return the urgency level (urgent, fairly urgent, or non-urgent).
//         dont give me explaination just say urgent , not urgent and fairly urgent thats it
//     `;

//   try {
//     const response = await client.chat.completions.create({
//       model: "gpt-4", // You can use gpt-4 or gpt-3.5-turbo depending on your setup
//       messages: [{ role: "user", content: prompt }],
//     });
//     return response.choices[0].message.content.trim().toLowerCase();
//   } catch (error) {
//     console.error("Error classifying priority:", error);
//     return "non-urgent";
//   }
// };


const classifyPriority = async (problemStatement) => {
    const prompt = `
        Based on the following problem statement, classify it into one of these categories: urgent, fairly urgent, non-urgent.
        Problem statement: "${problemStatement}".
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
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim().toLowerCase();
    } catch (error) {
        console.error('Error classifying priority:', error);
        return 'non-urgent'; 
    }
};


// const generateTagline = async (problemStatement) => {
//   const prompt = `Creami una dichiarazione in una riga per il seguente problema: "${problemStatement}". Rendilo super semplificato in una sola riga senza alcuna decorazione di testo o nuove righe. Traducilo in italiano e fornisci solo uno slogan senza dare dettagli, rendilo pertinente e diretto al punto.`;


//   try {
//     const response = await client.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: prompt }],
//     });
//     return response.choices[0].message.content.trim().toLowerCase();
//   } catch (error) {
//     console.error("Error generating tagline:", error);
//     return "No tagline available.";
//   }
// };

const generateTagline = async (problemStatement) => {
    const prompt = `Creami una dichiarazione in una riga per il seguente problema: "${problemStatement}". Rendilo super semplificato in una sola riga senza alcuna decorazione di testo o nuove righe. Traducilo in italiano e fornisci solo uno slogan senza dare dettagli, rendilo pertinente e diretto al punto.`;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Error generating tagline:', error);
        return 'No tagline available.';
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
  const { problemStatement, userId, username, condominiumId } = req.params;
  console.log(problemStatement);

  // Define the prompt with clear instructions to classify the user input
  const prompt = `
    This is the user input: "${problemStatement}".
    Your task is to classify the input into one of the following categories:
    - 0: Appreciation /Best wishes (e.g., "Thank you", "Thanks a lot", "You are great","have a good day","have a nice day etc").
    - 1: Acknowledgment (e.g., "Yes, I got it", "Acknowledged").
    - 2: Problem Statement (A clear problem description, e.g., "The camera is not working", "The door is jammed").
    - 3: Vague Problem (e.g., "I have a problem", "I am facing an issue" where the actual problem isn't described).

    Return only one number (0, 1, 2, or 3), without any additional text or justification.
  `;

  try {
    // Initialize the Google Generative AI model
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Get the AI-generated response based on the problem statement
    const result = await model.generateContent(prompt);
    const responseCode = result.response.text().trim();

    // Handle different responses based on the AI's classification
    if (responseCode === '0') {
      // User appreciation message
      const appreciationPrompt = `
        This is the user's appreciation: "${problemStatement}".
       Now identify the user's appreciation if it is "thank you" etc , you just return with any one of the only message like  :
        - "Di nulla!"
        - "Prego!"
        - "Non c’è di che!"

     Now identify the user's best wishes like  if it is  "have a nice day" or "have a good day" etc, you just return with any one of the only message like:
        - "Grazie, anche a te."
        - "Grazie, altrettanto."
        - "Grazie, buona giornata anche a te.
        
        just say one word only no need to create a big statement just your welcome or thank you etc nothing much more and it should be italian languge only
        "
      `;

      const appreciationResponse = await model.generateContent(appreciationPrompt);
      res.status(200).json({
        response: appreciationResponse.response.text().trim(),
        isProblem: false
      });
    } else if (responseCode === '3') {
      // Vague problem statement
      res.status(200).json({
        response: "Per favore, ditemi qual è il problema che state affrontando",
        isProblem: false
      });
    } else if (responseCode === '2') {
      // Actual problem statement (create ticket)
      const { response, tagline, priority, hasNextQuestion } = await aiproblemSolver({
        userId,
        problemStatement,
        username,
        condominiumId
      });
      const prompt=`After identifying the problem statement which is : ${problemStatement} you have choose any one of the template as response but only one not more than one and make it short dont give a detailed explaination and just give the response by choosing any one these randomly :
"Okay ${username}, grazie per la segnalazione. Abbiamo avvisato il tecnico e arriverà il prima possibile"
"Grazie per averci avvisato, ${username}. Abbiamo già contattato il tecnico, che arriverà al più presto."
"Perfetto ${username}, la tua segnalazione è stata presa in carico. Il tecnico è stato avvisato e si occuperà della situazione al più presto."
"Grazie ${username}, abbiamo inoltrato la segnalazione al tecnico. Si recherà da te il prima possibile."
"Ok ${username}, grazie per il messaggio. Il tecnico è già stato informato e arriverà al più presto."
"Grazie ${username}, abbiamo avvisato il tecnico che interverrà il prima possibile."`
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const result = await model.generateContent(prompt);
const message = result.response.text().trim();
      res.status(200).json({
        response: message,
        tagline,
        priority,
        hasNextQuestion,
        isProblem: true
      });
    } else if (responseCode === '1') {
      // Acknowledgment message
      res.status(200).json({
        response: `Grazie ${username}, abbiamo avvisato il tecnico che interverrà al più presto.`,
        isProblem: false
      });
    }
  } catch (error) {
    console.error("Error generating chatbot response:", error);

    // Fallback response in case of an error
    res.status(500).json({
      response: "Ci scusiamo per l'inconveniente. Si è verificato un errore durante l'elaborazione della richiesta. Si prega di riprovare più tardi o di contattare il nostro team di assistenza.",
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
