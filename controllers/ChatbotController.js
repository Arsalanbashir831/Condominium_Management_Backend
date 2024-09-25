const { GoogleGenerativeAI } = require('@google/generative-ai');
const translate = require('translate-google'); // Import translate-google
const MAX_QUESTIONS = 1;
const userConversations = {};

const classifyProblem = async (problemStatement) => {
    const prompt = `Classify the following problem statement into one of these categories: plumber, electrician, or technician. Problem statement: "${problemStatement}". Just mention the category name, no need for justification.`;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim().toLowerCase();
    } catch (error) {
        console.error('Error classifying problem:', error);
        return 'technician'; 
    }
};

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

const generateTagline = async (problemStatement) => {
    const prompt = `Create me a line statement for the following problem statement: "${problemStatement}". Make it super simplified in 1 line without any text decoration or new lines.`;

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

const generateInitialResponse = async (problemStatement, technicianType, tagline) => {
    const prompt = `You are the customer care assistant of a condominium manager. The problem statement is: "${problemStatement}". Now ask a follow-up question to understand their problem in detail. Limit to 1 question, relevant, and simple for a 70-year-old to understand.`;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Error generating initial response:', error);
        return `Thank you for reporting. We will inform the ${technicianType} based on the problem. Here's a tagline for your issue: "${tagline}".`;
    }
};

const translateToItalian = async (text) => {
    try {
        const translatedText = await translate(text, { to: 'it' });
        return translatedText;
    } catch (error) {
        console.error('Error translating to Italian:', error);
        return text;
    }
};

const geminiChat = async (req, res) => {
    try {
        const { userId, problemStatement,username } = req.body;

        if (!userId || !problemStatement) {
            return res.status(400).json({ message: 'UserId and problemStatement are required.' });
        }

        if (!userConversations[userId]) {
            const technicianType = await classifyProblem(problemStatement);
            const tagline = await generateTagline(problemStatement);
            const priority = await classifyPriority(problemStatement);  // New priority classification
            const initialResponse = await generateInitialResponse(problemStatement, technicianType, tagline);

            const translatedResponse = await translateToItalian(initialResponse);

            userConversations[userId] = {
                problemStatement,
                questionsAsked: 1,
                technicianType,
                tagline,
                priority,
                hasAskedPriority: false  // No need to ask priority anymore
            };

            return res.json({
                response: translatedResponse,
                hasNextQuestion: true,
                tagline,
                priority
            });
        }

        const userConversation = userConversations[userId];
        const hasNextQuestion = userConversation.questionsAsked < MAX_QUESTIONS;

        if (hasNextQuestion) {
            const prompt = `The user has described the following problem: "${problemStatement}". Based on this problem, generate a follow-up question to gather more details and better understand the issue.`;
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);

            userConversation.questionsAsked += 1;

            // Translate the follow-up question to Italian
            const translatedResponse = await translateToItalian(result.response.text());

            return res.json({
                response: translatedResponse,
                hasNextQuestion,
                tagline: userConversation.tagline,
                priority: userConversation.priority
            });
        }

        const finalResponse = `Perfect, okay, I understand ${username} the ${userConversation.technicianType} will come as soon as possible. `;

        // Translate the final response to Italian
        const translatedFinalResponse = await translateToItalian(finalResponse);

        return res.json({
            response: translatedFinalResponse,
            hasNextQuestion: false,
            tagline: userConversation.tagline,
            priority: userConversation.priority
        });

    } catch (error) {
        console.error('Error handling chatbot interaction:', error);
        res.status(500).json({ message: 'Error handling chatbot interaction', error: error.message });
    }
};

module.exports = geminiChat;
