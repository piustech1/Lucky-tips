import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function findTeamLogo(teamName: string): Promise<string> {
  if (!teamName) return "";
  
  try {
    const prompt = `Find the official high-resolution transparent PNG logo URL for the football team "${teamName}". 
    Prefer logos from trusted sources like media.api-sports.io, wikimedia, or official club sites. 
    Return ONLY the direct image URL string. If not found, return empty string.`;
    
    const result = await model.generateContent(prompt);
    const url = result.response.text().trim();
    
    // Simple validation
    if (url.startsWith('http')) {
      return url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff`;
  } catch (error) {
    console.error("Error finding logo:", error);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&color=fff`;
  }
}
