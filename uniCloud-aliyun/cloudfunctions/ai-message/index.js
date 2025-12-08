'use strict';

const API_KEY = 'sk-bb156e2f52354a55b01595850d13cea7';
const API_URL = 'https://api.deepseek.com/chat/completions';

exports.main = async (event, context) => {
  const { content, type = 'wish' } = event; // type: 'wish' or 'fulfill'
  
  if (!content) {
    return {
      code: 400,
      message: 'Content is required'
    };
  }

  // Log the request
  console.log(`[ai-message] Received request - Type: ${type}, Content: ${content}`);

  const systemPrompt = type === 'wish' 
    ? '你是许愿助手。请根据用户输入的愿望，生成一句简短的许愿寄语（20字以内）。语气温暖、充满希望、积极向上。' 
    : '你是还愿助手。请根据用户输入的还愿内容，生成一句简短的还愿寄语（20字以内）。语气感恩、喜悦、充满正能量。';

  try {
    const startTime = Date.now();
    const response = await uniCloud.httpclient.request(API_URL, {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        max_tokens: 100,
        temperature: 0.7,
        stream: false
      },
      timeout: 10000 
    });
    const endTime = Date.now();
    console.log(`[ai-message] API call took ${endTime - startTime}ms`);

    if (response.status !== 200) {
      console.error('[ai-message] DeepSeek API Error:', response.data);
      return {
        code: 502,
        message: 'AI服务暂时不可用，请稍后重试',
        error: response.data
      };
    }

    const generatedText = response.data.choices[0].message.content.trim();
    
    // Content Filtering (Basic)
    const sensitiveWords = ['暴力', '色情', '赌博', '死', '杀'];
    if (sensitiveWords.some(word => generatedText.includes(word))) {
        console.warn('[ai-message] Generated text contains sensitive words');
        return {
            code: 400,
            message: '生成内容包含敏感词，请重试'
        };
    }

    // Simple length check
    if (generatedText.length > 50) {
        console.warn('[ai-message] Generated text too long:', generatedText);
    }

    return {
      code: 0,
      message: 'Success',
      data: {
        content: generatedText
      }
    };

  } catch (error) {
    console.error('[ai-message] Cloud Function Error:', error);
    return {
      code: 500,
      message: '服务器内部错误',
      error: error.message
    };
  }
};
