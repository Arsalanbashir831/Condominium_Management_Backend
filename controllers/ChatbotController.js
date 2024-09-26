const { OpenAI } = require("openai");
const translate = require("translate-google"); // Import translate-google
const MAX_QUESTIONS = 1;
const userConversations = {};
const client = new OpenAI({
  apiKey: process.env.OPENAI_API,
});

const classifyProblem = async (problemStatement) => {
  const prompt = `Classifica la seguente descrizione del problema in una di queste categorie: idraulico, elettricista o tecnico. Descrizione del problema: "${problemStatement}". Menziona solo il nome della categoria, senza bisogno di giustificazione.`;
  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo-instruct", // You can use gpt-4 or gpt-3.5-turbo depending on your setup
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error("Error classifying problem:", error);
    return "technician";
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
      model: "gpt-3.5-turbo-instruct", // You can use gpt-4 or gpt-3.5-turbo depending on your setup
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
      model: "gpt-3.5-turbo-instruct",
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error("Error generating tagline:", error);
    return "No tagline available.";
  }
};

const generateInitialResponse = async (
  problemStatement,
  technicianType,
  tagline
) => {
  const prompt = `
Sei l'assistente del servizio clienti di un gestore di condominio. Aiuta il cliente a identificare il ${problemStatement} nel loro condominio o appartamento. Fai una sola domanda in italiano, simile agli esempi seguenti:
### *1. Tubo rotto in area comune*
1. “Puoi dirmi esattamente dove si trova la perdita? È vicino a un’area specifica del giardino?”
2. “La perdita è molto evidente, o si tratta di una piccola infiltrazione d’acqua?”
3. “L’acqua sta fuoriuscendo velocemente o è una perdita lenta?”
### *2. Cancello del garage che non funziona*
1. “Il cancello emette qualche rumore quando provi ad aprirlo, o rimane completamente bloccato?”
### *3. Erba troppo alta nell’area comune*
1. “Puoi indicare quale parte del giardino ha bisogno di essere tagliata? È solo una zona specifica o tutta l’area verde?”
2. “L’erba è molto alta o necessita solo di una manutenzione leggera?”
3. “Hai notato altre aree comuni che hanno bisogno di manutenzione oltre al giardino?”
### *4. Ascensore fuori uso*
1. “Sai se l’ascensore è fermo a un piano preciso o tra due piani?”
2. “L’ascensore emette qualche suono d’allarme o è completamente fermo?”
### *5. Luci non funzionanti nella scala*
1. “Le luci sono spente solo su un piano o nell’intera scala?”
2. “Ci sono altre zone del condominio dove hai notato problemi con le luci?”
3. “Le lampadine sono completamente spente o fanno luce in modo intermittente?”
### *6. Porta d’ingresso che non si chiude*
1. “Il problema riguarda la serratura o la porta che non si allinea bene quando si chiude?”
2. “La porta rimane aperta completamente o si chiude solo parzialmente?”
3. “Hai notato se ci sono parti danneggiate sulla serratura o sulla maniglia?”
### *7. Rifiuti non raccolti nell’area comune*
1. “La mancata raccolta riguarda solo l’area principale o anche altre parti comuni?”
2. “Le aree di raccolta dei rifiuti sono accessibili, o c’è qualcosa che potrebbe aver bloccato il passaggio?”
3. “I rifiuti non sono stati raccolti solo oggi, o è successo anche nei giorni scorsi?”
### *8. Allarme antincendio suona in modo casuale*
1. “L’allarme suona solo in una specifica zona o in tutto il condominio?”
2. “Succede in momenti specifici della giornata o in modo casuale?”
3. “Ci sono altri segnali, come luci o spie, quando l’allarme suona?”
### *9. Disputa sul parcheggio*
1. “Qual è il numero del tuo posto auto, così posso verificare?”
2. “Se possibile, puoi descrivere l’auto che occupa il tuo posto?”
3. “Hai notato se la stessa auto parcheggia spesso nel tuo posto o è un caso isolato?”
### *10. Perdita dal tetto nel corridoio comune*
1. “Puoi dirmi esattamente dove si trova la perdita nel corridoio? Vicino a una porta o finestra?”
2. “La perdita è piccola o si è allargata notevolmente?”
3. “Hai notato altre infiltrazioni di acqua nella zona?”
### *11. Attrezzatura del parco giochi danneggiata*
1. “Quale parte del parco giochi è danneggiata? Si tratta di un’area specifica come altalene o scivolo?”
2. “L’attrezzatura è completamente inutilizzabile o è ancora parzialmente funzionante?”
3. “Hai notato altri giochi o attrezzature che necessitano manutenzione?”
### *12. Rumore proveniente da aree comuni*
1. “Puoi indicare da quale area comune proviene il rumore? È vicino a un cortile o in un’area specifica?”
2. “Il rumore avviene sempre alla stessa ora, o è casuale?”
3. “Hai notato chi sono le persone che causano il disturbo?”
### *13. Tombini intasati nel vialetto condiviso*
1. “Il problema riguarda solo un tombino o più di uno nel vialetto?”
2. “L’acqua riesce a defluire lentamente o è completamente bloccata?”
3. “Hai notato se il problema si verifica solo durante la pioggia intensa?”
### *14. Telecamera di sicurezza non funzionante*
1. “Quale telecamera di sicurezza ha smesso di funzionare? È quella all’ingresso o in un’altra area?”
2. “La telecamera è completamente spenta o mostra solo un’immagine sfocata?”
3. “Hai notato se il problema riguarda solo il live feed o anche la registrazione?”
### *15. Recinzione danneggiata nell’area perimetrale*
1. “Puoi specificare quale parte della recinzione è danneggiata? È vicino a un ingresso o in un’area particolare?”
2. “La recinzione è solo piegata o completamente caduta?”
3. “Hai notato se ci sono altri punti danneggiati lungo la recinzione?

make it a 1 line question based on the situation in italian
”`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo-instruct", // You can use gpt-4 or gpt-3.5-turbo depending on your setup
      messages: [{ role: "system", content: prompt }],
    });
    return response.choices[0].message.content.trim().toLowerCase();
  } catch (error) {
    console.error("Error generating initial response:", error);
    return `Thank you for reporting. We will inform the ${technicianType} based on the problem. Here's a tagline for your issue: "${tagline}".`;
  }
};

// const translateToItalian = async (text) => {
//   try {
//     const translatedText = await translate(text, { to: "it" });
//     return translatedText;
//   } catch (error) {
//     console.error("Error translating to Italian:", error);
//     return text;
//   }
// };


const simpleSupportChat = async (req, res) => {
  const { userInput } = req.params; 
console.log('input' , userInput);

  try {
    // Convert the user input to lowercase for case-insensitive matching
    const lowerInput = userInput.toLowerCase();
    
    // Define keywords indicating appreciation
    const appreciationKeywords = [
      "thanks",
      "thank you",
      "thank",
      "grazie",
      "appreciate",
      "apprezzo",
      "thanks a lot",
      "much appreciated",
      "thank you very much",
      // Additional Italian keywords
      "mille grazie", // a thousand thanks
      "ti ringrazio", // I thank you
      "grazie mille", // thank you very much
      "ringrazio", // I thank (formal)
      "sono grato", // I am grateful
      "sono riconoscente", // I am thankful
      "grazie tante", // many thanks
      "grazie per tutto" // thank you for everything
  ];
  
    
    // Check if the user input contains any appreciation keywords
    const isAppreciation = appreciationKeywords.some(keyword => lowerInput.includes(keyword));

    if (isAppreciation) {
      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo-instruct",
        messages: [
          {
            role: "assistant",
            content: `You have to understand user response and you already helped them. Now user is happy and saying: ${userInput}. Handle the user response in your way in 1 line like if user says: ${userInput}, then say "We are always here for you. It's my pleasure." So accept it like you are most welcome, we are always here to assist you.`
          }
        ],
      });

      // Get the response content
      const chatResponse = response.choices[0].message.content.trim();

      // Send the response back to the user
      res.status(200).json({ response: chatResponse, isProblem: false});
    } else{

      res.status(200).json({ response: "We are understanding your problem please wait", isProblem: true });
    }
  } catch (error) {
    console.error("Error generating chatbot response:", error);

    // Fallback response in case of an error
    res.status(500).json({
      message: "We apologize for the inconvenience. An error occurred while processing your request. Please try again later or contact our support team.",
    });
  }
};


const geminiChat = async (req, res) => {
  try {
    const { userId, problemStatement, username } = req.body;

    if (!userId || !problemStatement) {
      return res
        .status(400)
        .json({ message: "UserId and problemStatement are required." });
    }

    if (!userConversations[userId]) {
      const technicianType = await classifyProblem(problemStatement);
      const tagline = await generateTagline(problemStatement);
      const priority = await classifyPriority(problemStatement); // New priority classification
      const initialResponse = await generateInitialResponse(
        problemStatement,
        technicianType,
        tagline
      );

      // const translatedResponse = await translateToItalian(initialResponse);

      userConversations[userId] = {
        problemStatement,
        questionsAsked: 1,
        technicianType,
        tagline,
        priority,
        hasAskedPriority: false, // No need to ask priority anymore
      };

      return res.json({
        response: initialResponse,
        hasNextQuestion: true,
        tagline,
        priority,
      });
    }

    const userConversation = userConversations[userId];
    const hasNextQuestion = userConversation.questionsAsked < MAX_QUESTIONS;

    if (hasNextQuestion) {
      const prompt = `The user has described the following problem: "${problemStatement}". Based on this problem, generate a relevant question that helps the technician. Limit it to 1 question.only return the italian language`;

      const response = await client.chat.completions.create({
        model: "gpt-gpt-3.5-turbo-instruct", // You can use gpt-4 or gpt-3.5-turbo depending on your setup
        messages: [{ role: "user", content: prompt }],
      });

      userConversation.questionsAsked += 1;

      // Translate the follow-up question to Italian
      // const translatedResponse = await translateToItalian(
      //   response.choices[0].message.content.trim().toLowerCase()
      // );

      return res.json({
        response: response.choices[0].message.content.trim().toLowerCase(),
        hasNextQuestion,
        tagline: userConversation.tagline,
        priority: userConversation.priority,
      });
    }

    const finalResponse = `ok ${username}, grazie per la tua segnalazione. Abbiamo già avvisato il ${userConversation.technicianType} e arriverà il prima possibile.`;

    delete userConversations[userId];
    return res.json({
      response: finalResponse,
      hasNextQuestion: false,
      tagline: userConversation.tagline,
      priority: userConversation.priority,
    });
  } catch (error) {
    console.error("Error handling chatbot interaction:", error);
    res
      .status(500)
      .json({
        message: "Error handling chatbot interaction",
        error: error.message,
      });
  }
};

module.exports = {geminiChat, simpleSupportChat};
