const fs = require('fs');
const path = require('path');

/**
 * Generate Postman collection from Swagger JSON
 * Run this after starting your server to get the latest API docs
 */
async function generatePostmanCollection() {
    try {
        const response = await fetch('http://localhost:3001/api-docs.json');
        const swaggerSpec = await response.json();

        const postmanCollection = {
            info: {
                name: 'Rikhh API Collection',
                description: 'Complete API collection for Rikhh Backend',
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
            },
            item: [],
            variable: [
                {
                    key: 'baseUrl',
                    value: 'http://localhost:3001',
                    type: 'string'
                },
                {
                    key: 'authToken',
                    value: 'your_jwt_token_here',
                    type: 'string'
                }
            ]
        };

        // Group endpoints by tags (modules)
        const moduleGroups = {};

        Object.entries(swaggerSpec.paths).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, operation]) => {
                if (operation.tags && operation.tags.length > 0) {
                    const tag = operation.tags[0].replace(/[\[\]]/g, ''); // Remove brackets
                    
                    if (!moduleGroups[tag]) {
                        moduleGroups[tag] = [];
                    }

                    const request = {
                        name: operation.summary || `${method.toUpperCase()} ${path}`,
                        request: {
                            method: method.toUpperCase(),
                            header: [],
                            url: {
                                raw: '{{baseUrl}}' + path,
                                host: ['{{baseUrl}}'],
                                path: path.split('/').filter(p => p)
                            }
                        },
                        response: []
                    };

                    // Add authentication header if required
                    if (operation.security && operation.security.length > 0) {
                        request.request.header.push({
                            key: 'Authorization',
                            value: 'Bearer {{authToken}}',
                            type: 'text'
                        });
                    }

                    // Add request body if required
                    if (operation.requestBody) {
                        request.request.body = {
                            mode: 'raw',
                            raw: '{}',
                            options: {
                                raw: {
                                    language: 'json'
                                }
                            }
                        };
                    }

                    // Add query parameters if they exist
                    if (operation.parameters) {
                        const queryParams = operation.parameters.filter(p => p.in === 'query');
                        if (queryParams.length > 0) {
                            request.request.url.query = queryParams.map(param => ({
                                key: param.name,
                                value: param.schema?.default || '',
                                description: param.description || '',
                                disabled: false
                            }));
                        }
                    }

                    // Add path parameters if they exist
                    if (operation.parameters) {
                        const pathParams = operation.parameters.filter(p => p.in === 'path');
                        if (pathParams.length > 0) {
                            pathParams.forEach(param => {
                                const pathSegment = path.split('/').findIndex(p => p === `{${param.name}}`);
                                if (pathSegment !== -1) {
                                    request.request.url.path[pathSegment] = `{{${param.name}}}`;
                                    
                                    // Add variable for path parameter
                                    const existingVar = postmanCollection.variable.find(v => v.key === param.name);
                                    if (!existingVar) {
                                        postmanCollection.variable.push({
                                            key: param.name,
                                            value: `your_${param.name}_here`,
                                            type: 'string'
                                        });
                                    }
                                }
                            });
                        }
                    }

                    moduleGroups[tag].push(request);
                }
            });
        });

        // Create folders for each module
        Object.entries(moduleGroups).forEach(([moduleName, requests]) => {
            const folder = {
                name: moduleName,
                item: requests
            };
            postmanCollection.item.push(folder);
        });

        // Add a README folder at the top
        const readmeFolder = {
            name: '📚 API Documentation',
            item: [
                {
                    name: 'How to Use This Collection',
                    request: {
                        method: 'GET',
                        header: [],
                        url: {
                            raw: 'https://github.com/your-repo/rikhh-backend#api-documentation',
                            host: ['https://github.com'],
                            path: ['your-repo', 'rikhh-backend']
                        }
                    },
                    response: []
                },
                {
                    name: 'Authentication',
                    request: {
                        method: 'POST',
                        header: [
                            {
                                key: 'Content-Type',
                                value: 'application/json',
                                type: 'text'
                            }
                        ],
                        url: {
                            raw: '{{baseUrl}}/api/login',
                            host: ['{{baseUrl}}'],
                            path: ['api', 'login']
                        },
                        body: {
                            mode: 'raw',
                            raw: '{\n  "email": "your_email@example.com",\n  "password": "your_password"\n}',
                            options: {
                                raw: {
                                    language: 'json'
                                }
                            }
                        }
                    },
                    response: []
                },
                {
                    name: 'Environment Variables',
                    request: {
                        method: 'GET',
                        header: [],
                        url: {
                            raw: 'https://learning.postman.com/docs/sending-requests/managing-environments/',
                            host: ['https://learning.postman.com'],
                            path: ['docs', 'sending-requests', 'managing-environments']
                        }
                    },
                    response: []
                }
            ]
        };

        postmanCollection.item.unshift(readmeFolder);

        const outputPath = path.join(__dirname, '..', 'postman-collection.json');
        fs.writeFileSync(outputPath, JSON.stringify(postmanCollection, null, 2));

        console.log('✅ Postman collection generated successfully!');
        console.log(`📁 Location: ${outputPath}`);
        console.log('📂 Organized into module folders:');
        
        Object.keys(moduleGroups).forEach(module => {
            console.log(`   - ${module}: ${moduleGroups[module].length} endpoints`);
        });
        
        console.log('\n💡 Import this file into Postman');
        console.log('🔑 Set your authToken variable with a valid JWT token');
        console.log('🌐 Update baseUrl if your server runs on a different port');

    } catch (error) {
        console.error('❌ Error generating Postman collection:', error.message);
        console.log('💡 Make sure your server is running on http://localhost:3001');
    }
}

if (require.main === module) {
    generatePostmanCollection();
}

module.exports = { generatePostmanCollection };
