const { GoogleGenerativeAI } = require('@google/generative-ai');

const MAX_QUESTIONS = 2;
const userConversations = {}; 

const classifyProblem = async (problemStatement) => {

    const prompt = `Classify the following problem statement into one of these categories: plumber, electrician, or technician. Problem statement: "${problemStatement} just mention the category name no need for the justification"`;
    
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

const geminiChat = async (req, res) => {
    try {
        const { userId, problemStatement } = req.body;

        if (!userId || !problemStatement) {
            return res.status(400).json({ message: 'UserId and problemStatement are required.' });
        }

        if (!userConversations[userId]) {
            userConversations[userId] = {
                problemStatement,
                questionsAsked: 0,
                technicianType: await classifyProblem(problemStatement),
            };
        }

        const userConversation = userConversations[userId];
        const hasNextQuestion = userConversation.questionsAsked < MAX_QUESTIONS;

        if (!hasNextQuestion) {
        
            const technicianType = userConversation.technicianType;
            const responseMessage = `Thank you for reporting. We will inform the ${technicianType} based on the problem.`;
            delete userConversations[userId]; 
            return res.json({
                response: responseMessage,
            });
        }

        const prompt = `The user has described the following problem: "${problemStatement}". Based on this problem, generate a follow-up question to gather more details and better understand the issue.`;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);

        userConversation.questionsAsked += 1; 

        res.json({
            followUpQuestion: result.response.text(),
        });

    } catch (error) {
        console.error('Error handling chatbot interaction:', error);
        res.status(500).json({ message: 'Error handling chatbot interaction', error: error.message });
    }
};

module.exports = geminiChat;
