const aiMessage = require('../../uniCloud-aliyun/cloudfunctions/ai-message/index.js');

// Mock uniCloud
global.uniCloud = {
  httpclient: {
    request: jest.fn()
  }
};

describe('AI Message Cloud Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return error if content is missing', async () => {
    const result = await aiMessage.main({}, {});
    expect(result.code).toBe(400);
    expect(result.message).toBe('Content is required');
  });

  test('should call DeepSeek API and return content for wish', async () => {
    // Mock successful response
    uniCloud.httpclient.request.mockResolvedValue({
      status: 200,
      data: {
        choices: [
          {
            message: {
              content: 'May your wish come true'
            }
          }
        ]
      }
    });

    const result = await aiMessage.main({ content: 'I wish for peace', type: 'wish' }, {});

    expect(uniCloud.httpclient.request).toHaveBeenCalledWith(
      expect.stringContaining('deepseek.com'),
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'user', content: 'I wish for peace' },
            { role: 'system', content: expect.stringContaining('你是许愿助手') }
          ])
        })
      })
    );

    expect(result.code).toBe(0);
    expect(result.data.content).toBe('May your wish come true');
  });

  test('should call DeepSeek API and return content for fulfill', async () => {
    // Mock successful response
    uniCloud.httpclient.request.mockResolvedValue({
      status: 200,
      data: {
        choices: [
          {
            message: {
              content: 'Blessings on you'
            }
          }
        ]
      }
    });

    const result = await aiMessage.main({ content: 'I passed the exam', type: 'fulfill' }, {});

    expect(uniCloud.httpclient.request).toHaveBeenCalledWith(
      expect.stringContaining('deepseek.com'),
      expect.objectContaining({
        method: 'POST',
        data: expect.objectContaining({
          messages: expect.arrayContaining([
            { role: 'user', content: 'I passed the exam' },
            { role: 'system', content: expect.stringContaining('你是还愿助手') }
          ])
        })
      })
    );

    expect(result.code).toBe(0);
    expect(result.data.content).toBe('Blessings on you');
  });

  test('should handle API errors', async () => {
    uniCloud.httpclient.request.mockResolvedValue({
      status: 500,
      data: { error: 'Server Error' }
    });

    const result = await aiMessage.main({ content: 'test' }, {});
    expect(result.code).toBe(502);
    expect(result.message).toBe('AI服务暂时不可用，请稍后重试');
  });
  
  test('should handle exceptions', async () => {
    uniCloud.httpclient.request.mockRejectedValue(new Error('Network Error'));

    const result = await aiMessage.main({ content: 'test' }, {});
    expect(result.code).toBe(500);
    expect(result.message).toBe('服务器内部错误');
  });
});
