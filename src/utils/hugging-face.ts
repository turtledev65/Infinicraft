export type HFApiResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
};

export type HFChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type HFQueryData = {
  messages: HFChatMessage[];
  model: string;
};

export const DEFAULT_MODEL = "meta-llama/Llama-3.3-70B-Instruct:novita";

export async function query(data: HFQueryData) {
  try {
    let response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    const parsedResponse = (await response.json()) as HFApiResponse;
    return parsedResponse;
  } catch (err) {
    console.error(err);
  }
}
