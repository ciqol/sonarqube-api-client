import { createError } from './sonar.error';

describe('createError()', () => {
  it('should create a SonarApiError with a plain text response', async () => {
    const response = new Response('Some error message', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    const error = await createError(response);

    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', 'Some error message');
    expect(error).toHaveProperty('status', 500);
    expect(error).toHaveProperty('error', 'Internal Server Error');
    expect(error).toHaveProperty('errors', []);
  });

  it('should create a SonarApiError with a JSON response containing errors', async () => {
    const responseBody = JSON.stringify({
      errors: [{ msg: 'Invalid token' }, { msg: 'Access denied' }],
    });

    const response = new Response(responseBody, {
      status: 401,
      statusText: 'Unauthorized',
    });

    const error = await createError(response);

    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', responseBody);
    expect(error).toHaveProperty('status', 401);
    expect(error).toHaveProperty('error', 'Unauthorized');
    expect(error).toHaveProperty('errors', [{ msg: 'Invalid token' }, { msg: 'Access denied' }]);
  });

  it('should create a SonarApiError with an empty body response', async () => {
    const response = new Response(null, {
      status: 404,
      statusText: 'Not Found',
    });

    const error = await createError(response);

    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', 'Not Found');
    expect(error).toHaveProperty('status', 404);
    expect(error).toHaveProperty('error', 'Not Found');
    expect(error).toHaveProperty('errors', []);
  });

  it('should handle malformed JSON gracefully', async () => {
    const response = new Response('{"invalid}', {
      status: 400,
      statusText: 'Bad Request',
    });

    const error = await createError(response);

    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', '{"invalid}');
    expect(error).toHaveProperty('status', 400);
    expect(error).toHaveProperty('error', 'Bad Request');
    expect(error).toHaveProperty('errors', []);
  });
});
