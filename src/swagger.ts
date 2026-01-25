import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Posts, Comments & Users API',
      version: '1.0.0',
      description: 'A RESTful API with JWT auth, posts, comments, and users',
      contact: { name: 'Your Name', email: 'developer@example.com' },
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}`, description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'JWT Authorization header' }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            username: { type: 'string', example: 'user' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' },
          }
        },
        Post: {
          type: 'object',
          required: ['title', 'content', 'senderId'],
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            title: { type: 'string', example: 'Hello World' },
            content: { type: 'string', example: 'This is my first post' },
            senderId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          required: ['content', 'postId', 'userId'],
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
            content: { type: 'string', example: 'Nice post!' },
            postId: { type: 'string', example: '507f1f77bcf86cd799439013' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439012' }
          }
        },
        CreatePostRequest: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string', example: 'Hello World' },
            content: { type: 'string', example: 'This is my first post' }
          }
        },
        CreateCommentRequest: {
          type: 'object',
          required: ['content', 'postId'],
          properties: {
            content: { type: 'string', example: 'Nice post!' },
            postId: { type: 'string', example: '507f1f77bcf86cd799439013' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', example: 'user' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR...' }
          }
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR...' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' },
            status: { type: 'number', example: 400 }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            username: { type: 'string', example: 'newusername' },
            email: { type: 'string', format: 'email', example: 'newemail@example.com' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User login/register/refresh' },
      { name: 'Posts', description: 'CRUD operations for posts' },
      { name: 'Comments', description: 'CRUD operations for comments' },
      { name: 'Users', description: 'User profile management' }
    ]
  },
  apis: []
};

const manualPaths = {
  '/auth/register': {
    post: {
      tags: ['Authentication'],
      summary: 'Register a new user',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
      responses: {
        201: { description: 'User registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        400: { description: 'Invalid input' },
        500: { description: 'Server error' }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Authentication'],
      summary: 'Login user',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
      responses: {
        200: { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        400: { description: 'Missing email/password' },
        401: { description: 'Invalid credentials' },
        500: { description: 'Server error' }
      }
    }
  },
  '/auth/refresh': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh JWT tokens',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } } },
      responses: {
        200: { description: 'Tokens refreshed', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
        400: { description: 'Refresh token required' },
        401: { description: 'Invalid refresh token' }
      }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout user (clear all sessions)',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'Logged out successfully', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'Logged out successfully, all sessions cleared' } } } } } },
        401: { description: 'Invalid token' }
      }
    }
  },

  '/post': {
    get: {
      tags: ['Posts'],
      summary: 'Get all posts or posts by sender',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'sender', in: 'query', required: false, schema: { type: 'string' }, description: 'Optional sender ID to filter posts' }],
      responses: { 200: { description: 'List of posts', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Post' } } } } }, 400: { description: 'Invalid input' } }
    },
    post: {
      tags: ['Posts'],
      summary: 'Create a new post',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePostRequest' } } } },
      responses: { 201: { description: 'Post created' }, 400: { description: 'Invalid input' }, 401: { description: 'Unauthorized' } }
    }
  },
  '/post/{id}': {
    get: {
      tags: ['Posts'],
      summary: 'Get post by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Post details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Post' } } } }, 404: { description: 'Post not found' } }
    },
    put: {
      tags: ['Posts'],
      summary: 'Update post',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePostRequest' } } } },
      responses: { 200: { description: 'Post updated' }, 400: { description: 'Invalid input' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden: cannot edit this post' }, 404: { description: 'Post not found' } }
    },
    delete: {
      tags: ['Posts'],
      summary: 'Delete post',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Post deleted' }, 401: { description: 'Unauthorized' }, 404: { description: 'Post not found' } }
    }
  },

  '/comment': {
    get: {
      tags: ['Comments'],
      summary: 'Get all comments',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of all comments', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Comment' } } } } }, 401: { description: 'Unauthorized' } }
    },
    post: {
      tags: ['Comments'],
      summary: 'Create a new comment',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCommentRequest' } } } },
      responses: { 201: { description: 'Comment created' }, 400: { description: 'Invalid input' }, 401: { description: 'Unauthorized' } }
    }
  },
  '/comment/post': {
    get: {
      tags: ['Comments'],
      summary: 'Get comments by postId',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'postId', in: 'query', required: true, schema: { type: 'string' }, description: 'Post ID to filter comments' }],
      responses: { 200: { description: 'List of comments for the specified post', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Comment' } } } } }, 400: { description: 'Missing postId' }, 401: { description: 'Unauthorized' } }
    }
  },
  '/comment/{id}': {
    get: {
      tags: ['Comments'],
      summary: 'Get comment by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Comment details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Comment' } } } }, 404: { description: 'Comment not found' }, 401: { description: 'Unauthorized' } }
    },
    put: {
      tags: ['Comments'],
      summary: 'Update comment by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { content: { type: 'string' } } } } } },
      responses: { 200: { description: 'Comment updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Comment' } } } }, 400: { description: 'Invalid content' }, 403: { description: 'Forbidden: cannot edit this comment' }, 404: { description: 'Comment not found' }, 401: { description: 'Unauthorized' } }
    },
    delete: {
      tags: ['Comments'],
      summary: 'Delete comment by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'Comment deleted', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'Comment deleted' } } } } } }, 403: { description: 'Forbidden: cannot delete this comment' }, 404: { description: 'Comment not found' }, 401: { description: 'Unauthorized' } }
    }
  },

  '/user': {
    get: {
      tags: ['Users'],
      summary: 'Get all users',
      security: [{ bearerAuth: [] }],
      responses: { 200: { description: 'List of all users', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } }, 401: { description: 'Unauthorized' } }
    }
  },
  '/user/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'User details', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 400: { description: 'Invalid user ID format' }, 404: { description: 'User not found' }, 401: { description: 'Unauthorized' } }
    },
    put: {
      tags: ['Users'],
      summary: 'Update user profile',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } } },
      responses: { 200: { description: 'User updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 400: { description: 'Invalid input' }, 403: { description: 'Forbidden' }, 404: { description: 'User not found' }, 401: { description: 'Unauthorized' } }
    },
    delete: {
      tags: ['Users'],
      summary: 'Delete user account',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { 200: { description: 'User deleted successfully', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'User deleted successfully' } } } } } }, 403: { description: 'Forbidden' }, 404: { description: 'User not found' }, 401: { description: 'Unauthorized' } }
    }
  }
};

const completeOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: options.definition!.info!,
    servers: options.definition!.servers,
    components: options.definition!.components,
    tags: options.definition!.tags,
    paths: manualPaths,
    security: [{ bearerAuth: [] }],
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(completeOptions);

export { swaggerUi, swaggerSpec };
