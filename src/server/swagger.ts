import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SQL Challenge API",
            version: "1.0.0",
            description: "API do jogo de desafios SQL — Mundo Mágico",
        },
        servers: [
            { url: "https://apihub-macedo.duckdns.org", description: "VPS (produção)" },
            { url: "http://localhost:3000", description: "Local" },
        ],
        tags: [
            { name: "Desafios" },
            { name: "Capítulos" },
            { name: "Objetivos" },
            { name: "Dicas" },
            { name: "Consultas" },
            { name: "Visões" },
            { name: "Usuários" },
            { name: "Challenge" },
        ],
        components: {
            schemas: {
                Desafio: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        titulo: { type: "string" },
                        descricao: { type: "string" },
                        tempoEstimado: { type: "string" },
                        taxaConclusao: { type: "number" },
                        criadoEm: { type: "string", format: "date-time" },
                        atualizadoEm: { type: "string", format: "date-time" },
                    },
                },
                Capitulo: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        idDesafio: { type: "integer" },
                        introHistoria: { type: "string" },
                        xpRecompensa: { type: "integer" },
                        contextoHistoria: { type: "string" },
                        numero: { type: "integer" },
                    },
                },
                Objetivo: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        idCapitulo: { type: "integer" },
                        descricao: { type: "string" },
                        ordem: { type: "integer" },
                        nivel: { type: "integer" },
                    },
                },
                Dica: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        idCapitulo: { type: "integer" },
                        ordem: { type: "integer" },
                        conteudo: { type: "string" },
                        penalidadeXp: { type: "integer" },
                    },
                },
                Consulta: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        idCapitulo: { type: "integer" },
                        query: { type: "string" },
                        colunas: { type: "array", items: { type: "string" } },
                        resultado: { type: "object", nullable: true },
                    },
                },
                Visao: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        idCapitulo: { type: "integer" },
                        comando: { type: "string" },
                    },
                },
                CapituloView: {
                    type: "object",
                    properties: {
                        capitulo: { $ref: "#/components/schemas/Capitulo" },
                        objetivos: { type: "array", items: { $ref: "#/components/schemas/Objetivo" } },
                        dicas: { type: "array", items: { $ref: "#/components/schemas/Dica" } },
                        consultaSolucao: { $ref: "#/components/schemas/Consulta" },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        error: { type: "string" },
                    },
                },
            },
        },
        paths: {
            // ── Desafios ──────────────────────────────────────────────────
            "/api/desafios": {
                get: {
                    tags: ["Desafios"],
                    summary: "Lista todos os desafios",
                    responses: {
                        200: {
                            description: "OK",
                            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Desafio" } } } },
                        },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/desafios/{id}": {
                get: {
                    tags: ["Desafios"],
                    summary: "Busca desafio por ID",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Desafio" } } } },
                        500: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            // ── Challenge ─────────────────────────────────────────────────
            "/api/challenge": {
                get: {
                    tags: ["Challenge"],
                    summary: "Lista todos os challenges",
                    responses: {
                        200: { description: "OK" },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/challenge/get-by-id/{id}": {
                get: {
                    tags: ["Challenge"],
                    summary: "Busca challenge por ID",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK" },
                        500: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/challenge/get-with-capitulo": {
                post: {
                    tags: ["Challenge"],
                    summary: "Busca challenge com capítulo",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        id: { type: "integer", example: 1 },
                                        capituloId: { type: "integer", example: 1 },
                                    },
                                    required: ["id", "capituloId"],
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "OK" },
                        500: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            // ── Capítulos ─────────────────────────────────────────────────
            "/api/capitulo": {
                get: {
                    tags: ["Capítulos"],
                    summary: "Lista todos os capítulos",
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Capitulo" } } } } },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/capitulo/{id}": {
                get: {
                    tags: ["Capítulos"],
                    summary: "Busca capítulo por ID",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Capitulo" } } } },
                        500: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/capitulo/view/{id}": {
                get: {
                    tags: ["Capítulos"],
                    summary: "Retorna capítulo completo (com objetivos, dicas e consulta-solução)",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: {
                            description: "OK",
                            content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/CapituloView" } } } } },
                        },
                        400: { description: "ID inválido", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                        404: { description: "Consulta não encontrada para o capítulo", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            // ── Objetivos ─────────────────────────────────────────────────
            "/api/objetivos": {
                get: {
                    tags: ["Objetivos"],
                    summary: "Lista todos os objetivos",
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Objetivo" } } } } },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/objetivos/{id}": {
                get: {
                    tags: ["Objetivos"],
                    summary: "Busca objetivo por ID",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Objetivo" } } } },
                        500: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            // ── Dicas ─────────────────────────────────────────────────────
            "/api/dicas": {
                get: {
                    tags: ["Dicas"],
                    summary: "Lista todas as dicas",
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Dica" } } } } },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/dicas/{id}": {
                get: {
                    tags: ["Dicas"],
                    summary: "Busca dica por ID",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Dica" } } } },
                        500: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/dicas/capitulo/{idCapitulo}": {
                get: {
                    tags: ["Dicas"],
                    summary: "Lista dicas de um capítulo",
                    parameters: [{ name: "idCapitulo", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Dica" } } } } },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            // ── Consultas ─────────────────────────────────────────────────
            "/api/consultas": {
                get: {
                    tags: ["Consultas"],
                    summary: "Lista todas as consultas-solução",
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Consulta" } } } } },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/consultas/{id}": {
                get: {
                    tags: ["Consultas"],
                    summary: "Busca consulta-solução por ID",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Consulta" } } } },
                        500: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            // ── Visões ────────────────────────────────────────────────────
            "/api/visoes": {
                get: {
                    tags: ["Visões"],
                    summary: "Lista todas as visões",
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Visao" } } } } },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/visoes/{id}": {
                get: {
                    tags: ["Visões"],
                    summary: "Busca visão por ID",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Visao" } } } },
                        500: { description: "Não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/api/visoes/{id}/dados": {
                get: {
                    tags: ["Visões"],
                    summary: "Executa a view no banco e retorna os dados",
                    parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }],
                    responses: {
                        200: { description: "OK — dados da view retornados" },
                        500: { description: "Erro interno", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            // ── Usuários ──────────────────────────────────────────────────
            "/api/user": {
                get: {
                    tags: ["Usuários"],
                    summary: "Lista todos os usuários",
                    responses: { 200: { description: "OK" }, 500: { description: "Erro interno" } },
                },
                post: {
                    tags: ["Usuários"],
                    summary: "Cria novo usuário (Firebase)",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string", example: "Rodrigo" },
                                        email: { type: "string", example: "rodrigo@email.com" },
                                        password: { type: "string", example: "senha123" },
                                    },
                                    required: ["name", "email", "password"],
                                },
                            },
                        },
                    },
                    responses: { 201: { description: "Criado" }, 500: { description: "Erro" } },
                },
                put: {
                    tags: ["Usuários"],
                    summary: "Atualiza usuário",
                    responses: { 200: { description: "OK" }, 500: { description: "Erro" } },
                },
            },
            "/api/user/auth": {
                post: {
                    tags: ["Usuários"],
                    summary: "Login com email e senha",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        email: { type: "string", example: "rodrigo@email.com" },
                                        password: { type: "string", example: "senha123" },
                                    },
                                    required: ["email", "password"],
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "Token retornado" }, 500: { description: "Credenciais inválidas" } },
                },
            },
            "/api/user/uid/{uid}": {
                get: {
                    tags: ["Usuários"],
                    summary: "Busca usuário por UID",
                    parameters: [{ name: "uid", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "OK" }, 500: { description: "Não encontrado" } },
                },
            },
            "/api/user/email/{email}": {
                get: {
                    tags: ["Usuários"],
                    summary: "Busca usuário por email",
                    parameters: [{ name: "email", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "OK" }, 500: { description: "Não encontrado" } },
                },
            },
            "/api/user/{uid}": {
                delete: {
                    tags: ["Usuários"],
                    summary: "Remove usuário por UID",
                    parameters: [{ name: "uid", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "Removido" }, 500: { description: "Erro" } },
                },
            },
            "/api/user/logout/{uid}": {
                post: {
                    tags: ["Usuários"],
                    summary: "Logout do usuário",
                    parameters: [{ name: "uid", in: "path", required: true, schema: { type: "string" } }],
                    responses: { 200: { description: "OK" }, 500: { description: "Erro" } },
                },
            },
            "/api/user/resetPassword/{uid}/{newPsw}": {
                post: {
                    tags: ["Usuários"],
                    summary: "Redefine senha do usuário",
                    parameters: [
                        { name: "uid", in: "path", required: true, schema: { type: "string" } },
                        { name: "newPsw", in: "path", required: true, schema: { type: "string" } },
                    ],
                    responses: { 200: { description: "OK" }, 500: { description: "Erro" } },
                },
            },
        },
    },
    apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
