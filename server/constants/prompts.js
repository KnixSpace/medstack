export const titlePrompt = (userInput, type) =>
  `### **Goal**  
Generate a concise, engaging, and relevant title for a **Space** (Board) or **Thread** (Blog) using the provided topic or sentence. Ensure the title is user-friendly, grammatically correct, and free of offensive language.  

### **Return Format**  
Provide a **single best title** in the following format:  
"<title>"  

### **Warnings**  
- Avoid generating titles with inappropriate, harmful, or biased language.  
- The title must be between 4 to 12 words. Do not return titles with fewer than 4 words or more than 12 words.
- Maintain the original meaning of the provided input while enhancing clarity and appeal.  
- Do not include brand names, copyrighted terms, or trademarked content.

### **Context Dump (User Input)**  
- **Type:** ${type}  
- **Topic or Sentence:** ${userInput}
`;

export const spaceDescriptionPrompt = (userInput, title = null) => `
### **Goal**  
Generate a clear, engaging, and relevant **Space(board) Description** based on the provided **Space(board) Title** and **Topic or Sentence**. The description should explain the purpose of the board and attract users to participate. If no title is provided, generate the description using the user's input alone.  

### **Return Format**  
Provide a **single description** in the following format:  
"<description>"  

### **Warnings**  
- Avoid generating descriptions with inappropriate, harmful, or biased language.  
- The description must be between **4 to 64 words**. Do not return descriptions with fewer than 4 words or more than 64 words.  
- Ensure the description remains aligned with the provided title and topic.  
- Maintain clarity and appeal to the intended audience.  
- **Only return one description, not a list of options.**  

### **Context Dump (User Input)**  
${title && `- **Board Title (Optional):** ${title}`}
- **Topic or Sentence:** ${userInput}
`;

export const threadContentPrompt = (userInput, title = null, tone = null) =>
  `
### **Goal**  
Generate a detailed, well-structured **Thread(blog) Content** based on the provided **Thread(blog) Title** and **Topic or Sentence**. The content should align with the given tone if specified. If no tone is provided, apply an appropriate tone based on the topic. The output should be in **Markdown** format for easy rendering.  

### **Return Format**  
Provide a **single Thread(blog) content** in Markdown, maintaining logical flow and structure.  

### **Warnings**  
- Avoid generating content with inappropriate, harmful, or biased language.  
- Ensure the content is between **10 to 512 words**. Do not return content with fewer than 10 words or more than 512 words.  
- The content must stay relevant to the provided title and topic.  
- Follow the specified tone if provided. Otherwise, choose a suitable tone based on the input.  
- **Only return one Thread(blog) content, not a list of options.**  

### **Context Dump (User Input)**  
${title && `- **Thread(blog) Title (Optional):** ${title}`} 
- **Topic or Sentence:** ${userInput} 
${tone && `- **Tone (Optional):** $`} 
`;

export const rephrasePrompt = (rephraseContent) =>
  `
### **Goal**  
Rephrase the provided content to maintain the same meaning but with different phrasing, ensuring it sounds fresh and original. The rephrased content should retain the key points and context of the original content, but avoid plagiarism and make the language unique.  

### **Return Format**  
Provide a **single rephrased content** in the following format:  
"content" 

### **Warnings**  
- Ensure the rephrased content maintains the original meaning and intent.  
- Avoid altering the key information or changing the message.  
- Do not use the exact same phrasing as the original; ensure the rephrased content is unique.  
- If the tone of the original content is specified, keep the tone consistent.  
- **Only return one rephrased content, not a list of options.**  

### **Context Dump (User Input)**  
- **Rephrasing Content:** ${rephraseContent}
- **Note:** This content is based on the original content. Rephrase accordingly. 
`;
