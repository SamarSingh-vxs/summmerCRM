import {GoogleGenAI} from "@google/genai";
import { ApiError } from "../utils/ApiError.js";

let client = null;

const getClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ApiError(
            503,"Gemini Api Key is not configured. Add Gemini_API_KEY to the backend .env file."
        );
    }
    if (!client) client = new GoogleGenAI({apiKey});
    return client
};

const MODEL = () =>  process.env.Gemini_MODEL || "gemini-2.5-flash";

export const isAIconfigured = () => Boolean(process.env.GEMINI_API_KEY)

const generateJSON = async(prompt, schema) => {
    const ai = getClient();
    try{
        const response = await ai.models.generateContent({
            model : MODEL(),
             contents : prompt,
             config : {
                responseMimeType : "application/json",
                responseSchema : schema,
                temperature : 0.6,
             },
        });
        return JSON.parse(response.text);

    }catch (err) {
        console.error("Gemini JSON error : ",err?.message || err);
        throw new ApiError(502,"AI request failed. please try again in a moment.")
    }
};

const generateText = async (prompt , temperature = 0.7) => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model : MODEL(),
            contents : prompt,
            config : { temperature }
        });
        return response.text.trim();

    }catch (err) {
        console.error("Gemini text error :" , err?.message || err);
        throw new ApiError(502,"AI request failed. please try again in a moment.");

    }
}
export  const generateLeadSummary = async (lead) => {
    const prompt = `You are an expert B2B sales analyst for a CRM called summmerCrm . 
    Analyse the following sales lead and produce a concise assesment.
    
    Lead details:
    - Name : ${lead.name || "N/A"}
    - Company : ${lead.company || "N/A"}
    - Email : ${lead.email || "N/A"}
    - Current pipeline stage : ${lead.status || "new"}
    - Potential deal value : $${lead.value || 0}
    - Source : ${lead.source || "Unknown"}
    - Notes : ${lead.notes || "None"}

    Return Json only.
    `;
     const schema = {
        type : "object",
        properties : {
            summary : {
                type : "string",
                description : "2 - 3 sentence executive summary of the lead",

            },
            riskScore : {
                type : "integer",
                description : "Risk of losing this deal ,0 (safe) to 100 (high risk)",

            },
            suggestedPriority : {
                type : "string",
                enum : ["Low","Medium","High"],

            },
            nextBestAction : {
                type : "string",
                description : "one concrete recommended next step",
            },
                 },
                 required : ["summary" , "riskScore" , "suggestedPriority","nextBestAction"],

     }
     return generateJson (prompt,schema)
}

export const generateEmail = async ({lead,purpose,tone,sender}) => {
    const prompt = `you are a senior sales rep writing on behalf of ${
        sender?.name || "our team"
    }${sender?.company ? `at ${sender.company}` : ""}.

    write a proffesional sales email.
    purpose : ${purpose || "follow-up"}
    Desired tone ${tone || "friendly and professional"}
    
    Recipient (lead) Details:
    -Name : ${lead?.name || "there"}
    -company : ${lead?.company || "N/A"}
    -pipeline stage: ${lead?.status || "New"}
    -Context / notes: ${lead?.notes || "None"}

    Return JSON only with a compelling subject line and a complete email body.
    Use Line Breaks (\\n) in the body. keep it under 180 words.sign off as ${
        sender?.name || "the summmerCRM Team"
    }

    
    `;
    const schema = {
        type : "object",
        properties : { 
            subject: {type:"string"},
            body : {type:"string"},
        },
        required : ["subject" , "body"],
    };

    return generateJson(prompt,schema)
}
export const generateSalesInsights = async (pipelineStats) => {
    const prompt = `You are a revenue-operations advisor . Given this snapshot of a 
    sales pipeline, identify what is working , what is at risk , and concrete actions 
    to improve conversations.
    
    Pipeline snapshot (JSON):
    ${JSON.stringify(pipelineStats,null,2)}

    Return JSON only.
    `
    const schema = {
        type : 'object',
        properties : {
            headline : {
                type : "string",
                description : "One-Sentence summary of pipeline health"
            },
            insights : {
                type : "array",
                description : "3-5 specific , data-driven observations",
                items : {type : "string"}
            },
            recommendations : {
                type : "array",
                description : "3-5 prioritized,actionable recommendations",
                items : {type : "string"},
            },
            healthScore : {
                type : "integer",
                description : "Overall pipeline health, 0-100",
            },


        },
        required : ["headline","insights","recommendations","healthScore"],
    }
    return generateJSON(prompt,schema)

}

export {generateText} 