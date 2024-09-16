const { GoogleGenerativeAI } = require('@google/generative-ai');

const MAX_QUESTIONS = 2;
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

const generateTagline = async (problemStatement) => {
    const prompt = `Create a catchy tagline for the following problem statement: "${problemStatement}". The tagline should be brief and capture the essence of the problem and it should be in 1 line.`;
    
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
    const prompt = `you are the customer care assistance of condominium manager customer mention the problem statment that :  "${problemStatement} now ask counter question to understand their problem in detail". Mention the category of technician (e.g., plumber, electrician, technician) and include a tagline for the issue: "${tagline}".`;
    
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

const geminiChat = async (req, res) => {
    try {
        const { userId, problemStatement } = req.body;

        if (!userId || !problemStatement) {
            return res.status(400).json({ message: 'UserId and problemStatement are required.' });
        }

        if (!userConversations[userId]) {
            const technicianType = await classifyProblem(problemStatement);
            const tagline = await generateTagline(problemStatement);
            const initialResponse = await generateInitialResponse(problemStatement, technicianType, tagline);

            userConversations[userId] = {
                problemStatement,
                questionsAsked: 0,
                technicianType,
                tagline,
                isUrgent: problemStatement.toLowerCase().includes('urgent') || problemStatement.toLowerCase().includes('asap'), // Identify urgency from problem statement
                hasAskedUrgency: false
            };

            return res.json({
                response: initialResponse,
                hasNextQuestion: true,
                tagline,
                isUrgent: userConversations[userId].isUrgent
            });
        }

        const userConversation = userConversations[userId];

        if (userConversation.hasAskedUrgency) {
            if (problemStatement.toLowerCase() === 'yes' || problemStatement.toLowerCase() === 'no') {
                
                userConversation.isUrgent = problemStatement.toLowerCase() === 'yes';
                
                const technicianType = userConversation.technicianType;
                const responseMessage = `Thank you for reporting. We will inform the ${technicianType} based on the problem. We have noted that it is ${userConversation.isUrgent ? 'urgent' : 'not urgent'}.`;
                delete userConversations[userId]; 
                return res.json({
                    response: responseMessage,
                    hasNextQuestion: false,
                    tagline: userConversation.tagline,
                    isUrgent: userConversation.isUrgent
                });
            } else {
                // User input is not recognized
                return res.json({
                    response: 'Please reply with "yes" or "no" to indicate if the case is urgent.',
                    hasNextQuestion: false,
                    tagline: userConversation.tagline,
                    isUrgent: userConversation.isUrgent
                });
            }
        }

        const hasNextQuestion = userConversation.questionsAsked < MAX_QUESTIONS;

        if (hasNextQuestion) {
            const prompt = `The user has described the following problem: "${problemStatement}". Based on this problem, generate a follow-up question to gather more details and better understand the issue.`;
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);

            userConversation.questionsAsked += 1; 

            return res.json({
                response: result.response.text(),
                hasNextQuestion,
                tagline: userConversation.tagline,
                isUrgent: userConversation.isUrgent
            });
        } else if (!userConversation.hasAskedUrgency) {
            // Ask if it's an urgent case
            userConversation.hasAskedUrgency = true;
            return res.json({
                response: 'We have all the information we need. Is this an urgent case? (Reply with "yes" or "no")',
                hasNextQuestion: true,
                tagline: userConversation.tagline,
                isUrgent: userConversation.isUrgent
            });
        }

    } catch (error) {
        console.error('Error handling chatbot interaction:', error);
        res.status(500).json({ message: 'Error handling chatbot interaction', error: error.message });
    }
};

module.exports = geminiChat;
