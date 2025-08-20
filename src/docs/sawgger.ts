import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';

export function mountSwagger(app: Application) {
    const specs = swaggerJsdoc({
        definition: {
            openapi: '3.0.0',
            info: { 
                title: 'Rikhh API', 
                version: '1.0.0',
                description: 'Complete API documentation for Rikhh Backend',
                contact: {
                    name: 'API Support',
                    email: 'support@rikhh.com'
                }
            },
            servers: [
                { url: '/api/v1', description: 'Production API' },
                { url: '/api', description: 'Auth and other APIs' }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ]
        },
        apis: [
            'src/modules/**/*.routes.ts', 
            'src/modules/**/*.controller.ts', 
        ],
    });
    
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Rikhh API Documentation'
    }));
    
    app.get('/api-docs.json', (_, res) => res.json(specs));
}