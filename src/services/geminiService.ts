import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeLogic = async (text: string): Promise<AnalysisResult> => {
  try {
    const analysisPrompt = `
      당신은 논리 작법 및 수사학 전문가이자 교육 공학용 AI 멘토인 'LogicLens AI'입니다.
      이 프로그램은 사용자의 논리적 사고를 돕는 '조력자'이며, 제시하는 분석 결과는 '절대적인 정답'이 아닌 '발전을 위한 조언'임을 명심하세요.

      사용자가 입력한 다음 텍스트를 분석하여 논리의 허점을 찾아내고 설득력을 높일 수 있는 피드백을 제공하세요. 모든 피드백은 친절하고 전문적인 멘토의 어조를 유지해야 합니다.

      텍스트: "${text}"

      분석 가이드라인:
      1. Logic Map (논리 구조): 주장과 근거 사이의 개연성을 엄격히 따지되, '어떻게 개선하면 좋을지'에 초점을 맞추세요.
      2. 수사학적 개념: Logos(논리), Pathos(감성), Ethos(신뢰)의 영향력 강도를 0~100 사이의 수치로 측정하세요. (이 세 수치의 합이 100일 필요는 없으며, 각 요소가 본문에서 얼마나 강하게 나타나는지를 독립적으로 평가하여 성향을 보여주세요.)
      3. Grammar (문법 및 교정): 텍스트 전체의 맞춤법, 띄어쓰기, 어색한 문장 성분 호응을 정밀하게 검사하여 구체적으로 지적하세요.
      4. **무결점 교정 대본 (최우선 지침)**: 'speech_script'는 사용자의 원문을 바탕으로 하되, 논리적/수사학적/문법적으로 **단 하나의 오류도 없는 완벽한 최종 대본**으로 재작성해야 합니다. 원문의 분량과 정보량을 그대로 유지하면서도, 청중에게 가장 설득력 있게 다가갈 수 있는 세련된 문장들로 구성하세요. 절대 내용을 생략하거나 축소하지 마십시오.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "score", "logic_map", "balance", "suggestions", "grammar_fixes", "speech_script"],
          properties: {
            summary: { type: Type.STRING, description: "전체적인 분석 요약 (전문적이고 친절한 멘토 톤)" },
            score: { type: Type.NUMBER, description: "0-100 사이의 설득력 점수" },
            logic_map: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["stage", "content", "connectionAnalysis", "isLogical"],
                properties: {
                  stage: { type: Type.STRING, description: "서론/본론/결론 등" },
                  content: { type: Type.STRING, description: "해당 단계의 핵심 내용" },
                  connectionAnalysis: { type: Type.STRING, description: "논리적 연결성 분석" },
                  isLogical: { type: Type.BOOLEAN }
                }
              }
            },
            balance: {
              type: Type.OBJECT,
              required: ["logos", "pathos", "ethos"],
              properties: {
                logos: { type: Type.NUMBER, description: "논리(%)" },
                pathos: { type: Type.NUMBER, description: "감정(%)" },
                ethos: { type: Type.NUMBER, description: "신뢰(%)" }
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "논리적 설득력을 높이기 위한 구체적인 제안"
            },
            grammar_fixes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "맞춤법 및 문법 오류 지적 및 교정 제안"
            },
            speech_script: {
              type: Type.STRING,
              description: "자연스러운 구어체로 재작성된 대본"
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("AI 응답을 생성하지 못했습니다.");
    }

    return JSON.parse(resultText);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("분석 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
};
