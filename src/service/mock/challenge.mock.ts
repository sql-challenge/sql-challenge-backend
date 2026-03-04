import type { Mystery, MysteryDetail } from "../core/domain/challenge.entity";

export const mockMysteries: Mystery[] = [
    {
        id: "1",
        title: "O Caso do SELECT Perdido",
        description: "Um desenvolvedor júnior precisa encontrar todos os clientes ativos no banco de dados, mas não sabe como fazer isso.",
        difficulty: "beginner",
        category: "Fundamentos SQL",
        xpReward: 100,
        estimatedTime: "5 min",
        status: "available",
        completionRate: 92,
        icon: "🔍",
        tags: ["SELECT", "WHERE", "básico"],
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
    },
    {
        id: "2",
        title: "Mistério dos JOINs Quebrados",
        description: "Dados de pedidos e clientes estão separados. Você precisa uni-los para resolver o caso.",
        difficulty: "intermediate",
        category: "JOINs e Relacionamentos",
        xpReward: 250,
        estimatedTime: "12 min",
        status: "available",
        completionRate: 67,
        icon: "🔗",
        tags: ["JOIN", "INNER JOIN", "relacionamentos"],
        createdAt: "2024-01-20",
        updatedAt: "2024-01-20",
    },
    {
        id: "3",
        title: "O Enigma do GROUP BY",
        description: "Descubra quais produtos mais venderam usando agregação de dados.",
        difficulty: "intermediate",
        category: "Agregação e Análise",
        xpReward: 200,
        estimatedTime: "10 min",
        status: "available",
        completionRate: 75,
        icon: "📊",
        tags: ["GROUP BY", "COUNT", "agregação"],
        createdAt: "2024-01-25",
        updatedAt: "2024-01-25",
    },
    {
        id: "4",
        title: "A Conspiração dos Subqueries",
        description: "Use subqueries para descobrir transações suspeitas no sistema bancário.",
        difficulty: "advanced",
        category: "Queries Avançadas",
        xpReward: 350,
        estimatedTime: "15 min",
        status: "available",
        completionRate: 45,
        icon: "🕵️",
        tags: ["SUBQUERY", "IN", "avançado"],
        createdAt: "2024-02-01",
        updatedAt: "2024-02-01",
    },
];

// Mystery 1: Basic SELECT with WHERE
export const mysteryDetail1: MysteryDetail = {
    ...mockMysteries[0],
    storyIntro: "Era uma manhã chuvosa quando o detetive SQL recebeu um chamado urgente...",
    storyContext: "A empresa TechCorp perdeu acesso aos dados de seus clientes ativos. O sistema está funcionando, mas ninguém sabe como consultar apenas os clientes com status 'ativo'. Você foi chamado para resolver este caso usando suas habilidades em SQL.",
    objectives: [
        "Encontrar todos os clientes com status 'ativo'",
        "Ordenar os resultados por nome",
        "Retornar apenas as colunas: id, nome e email",
    ],
    hints: [
        {
            id: "1",
            order: 1,
            content: "Use a cláusula WHERE para filtrar registros",
            xpPenalty: 10,
        },
        {
            id: "2",
            order: 2,
            content: "A coluna 'status' contém o valor que você procura",
            xpPenalty: 15,
        },
        {
            id: "3",
            order: 3,
            content: "Use ORDER BY para ordenar os resultados",
            xpPenalty: 20,
        },
    ],
    database: {
        tables: [
            {
                name: "clientes",
                description: "Tabela contendo informações dos clientes",
                columns: [
                    {
                        name: "id",
                        type: "INTEGER",
                        nullable: false,
                        primaryKey: true,
                        description: "Identificador único do cliente",
                    },
                    {
                        name: "nome",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Nome completo do cliente",
                    },
                    {
                        name: "email",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Email do cliente",
                    },
                    {
                        name: "status",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Status do cliente (ativo, inativo, suspenso)",
                    },
                    {
                        name: "data_cadastro",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Data de cadastro do cliente",
                    },
                ],
                sampleData: [
                    { id: 1, nome: "João Silva", email: "joao@email.com", status: "ativo", data_cadastro: "2024-01-10" },
                    { id: 2, nome: "Maria Santos", email: "maria@email.com", status: "inativo", data_cadastro: "2024-01-12" },
                    { id: 3, nome: "Pedro Costa", email: "pedro@email.com", status: "ativo", data_cadastro: "2024-01-15" },
                    { id: 4, nome: "Ana Oliveira", email: "ana@email.com", status: "ativo", data_cadastro: "2024-01-18" },
                    { id: 5, nome: "Carlos Ferreira", email: "carlos@email.com", status: "suspenso", data_cadastro: "2024-01-20" },
                ],
            },
        ],
        relationships: [],
    },
    expectedOutput: {
        columns: ["id", "nome", "email"],
        rows: [
            { id: 4, nome: "Ana Oliveira", email: "ana@email.com" },
            { id: 1, nome: "João Silva", email: "joao@email.com" },
            { id: 3, nome: "Pedro Costa", email: "pedro@email.com" },
        ],
    },
    testCases: [
        {
            id: "1",
            description: "Deve retornar apenas clientes ativos",
            expectedResult: {
                columns: ["id", "nome", "email"],
                rows: [
                    { id: 4, nome: "Ana Oliveira", email: "ana@email.com" },
                    { id: 1, nome: "João Silva", email: "joao@email.com" },
                    { id: 3, nome: "Pedro Costa", email: "pedro@email.com" },
                ],
            },
            weight: 100,
        },
    ],
};

// Mystery 2: JOIN queries
export const mysteryDetail2: MysteryDetail = {
    ...mockMysteries[1],
    storyIntro: "Um crime cibernético foi cometido. Pedidos suspeitos aparecem no sistema...",
    storyContext: "A loja virtual detectou pedidos sem informação do cliente. Os dados estão em tabelas separadas e você precisa conectá-los para identificar quem fez cada pedido.",
    objectives: [
        "Unir as tabelas de pedidos e clientes",
        "Mostrar o nome do cliente junto com os dados do pedido",
        "Incluir apenas pedidos com status 'pendente'",
    ],
    hints: [
        {
            id: "1",
            order: 1,
            content: "Use INNER JOIN para conectar as tabelas",
            xpPenalty: 15,
        },
        {
            id: "2",
            order: 2,
            content: "A chave de ligação é cliente_id na tabela pedidos",
            xpPenalty: 20,
        },
        {
            id: "3",
            order: 3,
            content: "Não esqueça de filtrar pelo status 'pendente'",
            xpPenalty: 25,
        },
    ],
    database: {
        tables: [
            {
                name: "clientes",
                description: "Tabela de clientes da loja",
                columns: [
                    {
                        name: "id",
                        type: "INTEGER",
                        nullable: false,
                        primaryKey: true,
                        description: "ID do cliente",
                    },
                    {
                        name: "nome",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Nome do cliente",
                    },
                    {
                        name: "cidade",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Cidade do cliente",
                    },
                ],
                sampleData: [
                    { id: 1, nome: "Alice Souza", cidade: "São Paulo" },
                    { id: 2, nome: "Bruno Lima", cidade: "Rio de Janeiro" },
                    { id: 3, nome: "Carla Dias", cidade: "Belo Horizonte" },
                    { id: 4, nome: "Diego Rocha", cidade: "Curitiba" },
                ],
            },
            {
                name: "pedidos",
                description: "Tabela de pedidos realizados",
                columns: [
                    {
                        name: "id",
                        type: "INTEGER",
                        nullable: false,
                        primaryKey: true,
                        description: "ID do pedido",
                    },
                    {
                        name: "cliente_id",
                        type: "INTEGER",
                        nullable: false,
                        primaryKey: false,
                        foreignKey: {
                            table: "clientes",
                            column: "id",
                        },
                        description: "ID do cliente que fez o pedido",
                    },
                    {
                        name: "produto",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Nome do produto",
                    },
                    {
                        name: "valor",
                        type: "REAL",
                        nullable: false,
                        primaryKey: false,
                        description: "Valor do pedido",
                    },
                    {
                        name: "status",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Status do pedido",
                    },
                ],
                sampleData: [
                    { id: 101, cliente_id: 1, produto: "Notebook", valor: 3500.00, status: "entregue" },
                    { id: 102, cliente_id: 2, produto: "Mouse", valor: 50.00, status: "pendente" },
                    { id: 103, cliente_id: 1, produto: "Teclado", valor: 200.00, status: "pendente" },
                    { id: 104, cliente_id: 3, produto: "Monitor", valor: 800.00, status: "pendente" },
                    { id: 105, cliente_id: 4, produto: "Webcam", valor: 300.00, status: "entregue" },
                ],
            },
        ],
        relationships: [
            {
                fromTable: "pedidos",
                toTable: "clientes",
                type: "one-to-many",
                fromColumn: "cliente_id",
                toColumn: "id",
            },
        ],
    },
    expectedOutput: {
        columns: ["id", "nome", "produto", "valor"],
        rows: [
            { id: 102, nome: "Bruno Lima", produto: "Mouse", valor: 50.00 },
            { id: 103, nome: "Alice Souza", produto: "Teclado", valor: 200.00 },
            { id: 104, nome: "Carla Dias", produto: "Monitor", valor: 800.00 },
        ],
    },
    testCases: [
        {
            id: "1",
            description: "Deve retornar pedidos pendentes com nome do cliente",
            expectedResult: {
                columns: ["id", "nome", "produto", "valor"],
                rows: [
                    { id: 102, nome: "Bruno Lima", produto: "Mouse", valor: 50.00 },
                    { id: 103, nome: "Alice Souza", produto: "Teclado", valor: 200.00 },
                    { id: 104, nome: "Carla Dias", produto: "Monitor", valor: 800.00 },
                ],
            },
            weight: 100,
        },
    ],
};

// Mystery 3: GROUP BY and aggregation
export const mysteryDetail3: MysteryDetail = {
    ...mockMysteries[2],
    storyIntro: "O gerente de vendas precisa de um relatório urgente sobre os produtos mais vendidos...",
    storyContext: "A empresa precisa saber qual produto teve mais vendas para fazer um pedido de reposição. Os dados estão na tabela de vendas, mas precisam ser agrupados e contados.",
    objectives: [
        "Contar quantas vezes cada produto foi vendido",
        "Ordenar do mais vendido para o menos vendido",
        "Mostrar o nome do produto e a quantidade de vendas",
    ],
    hints: [
        {
            id: "1",
            order: 1,
            content: "Use GROUP BY para agrupar por produto",
            xpPenalty: 15,
        },
        {
            id: "2",
            order: 2,
            content: "COUNT(*) conta o número de linhas em cada grupo",
            xpPenalty: 20,
        },
        {
            id: "3",
            order: 3,
            content: "ORDER BY DESC ordena do maior para o menor",
            xpPenalty: 25,
        },
    ],
    database: {
        tables: [
            {
                name: "vendas",
                description: "Registro de todas as vendas realizadas",
                columns: [
                    {
                        name: "id",
                        type: "INTEGER",
                        nullable: false,
                        primaryKey: true,
                        description: "ID da venda",
                    },
                    {
                        name: "produto",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Nome do produto vendido",
                    },
                    {
                        name: "quantidade",
                        type: "INTEGER",
                        nullable: false,
                        primaryKey: false,
                        description: "Quantidade vendida",
                    },
                    {
                        name: "data_venda",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Data da venda",
                    },
                ],
                sampleData: [
                    { id: 1, produto: "Notebook", quantidade: 1, data_venda: "2024-02-01" },
                    { id: 2, produto: "Mouse", quantidade: 2, data_venda: "2024-02-01" },
                    { id: 3, produto: "Teclado", quantidade: 1, data_venda: "2024-02-02" },
                    { id: 4, produto: "Mouse", quantidade: 1, data_venda: "2024-02-02" },
                    { id: 5, produto: "Monitor", quantidade: 1, data_venda: "2024-02-03" },
                    { id: 6, produto: "Mouse", quantidade: 3, data_venda: "2024-02-03" },
                    { id: 7, produto: "Teclado", quantidade: 2, data_venda: "2024-02-04" },
                    { id: 8, produto: "Notebook", quantidade: 1, data_venda: "2024-02-04" },
                ],
            },
        ],
        relationships: [],
    },
    expectedOutput: {
        columns: ["produto", "total_vendas"],
        rows: [
            { produto: "Mouse", total_vendas: 3 },
            { produto: "Teclado", total_vendas: 2 },
            { produto: "Notebook", total_vendas: 2 },
            { produto: "Monitor", total_vendas: 1 },
        ],
    },
    testCases: [
        {
            id: "1",
            description: "Deve contar vendas por produto ordenado",
            expectedResult: {
                columns: ["produto", "total_vendas"],
                rows: [
                    { produto: "Mouse", total_vendas: 3 },
                    { produto: "Teclado", total_vendas: 2 },
                    { produto: "Notebook", total_vendas: 2 },
                    { produto: "Monitor", total_vendas: 1 },
                ],
            },
            weight: 100,
        },
    ],
};

// Mystery 4: Subqueries
export const mysteryDetail4: MysteryDetail = {
    ...mockMysteries[3],
    storyIntro: "O banco detectou transações suspeitas acima da média...",
    storyContext: "Transações com valores muito acima da média podem indicar fraude. Você precisa encontrar todas as transações que excedem a média de valor usando subqueries.",
    objectives: [
        "Calcular a média de valores das transações",
        "Encontrar transações com valor acima da média",
        "Mostrar conta, valor e descrição dessas transações",
    ],
    hints: [
        {
            id: "1",
            order: 1,
            content: "Use uma subquery com AVG() para calcular a média",
            xpPenalty: 20,
        },
        {
            id: "2",
            order: 2,
            content: "Compare o valor com (SELECT AVG(valor) FROM transacoes)",
            xpPenalty: 30,
        },
        {
            id: "3",
            order: 3,
            content: "Use WHERE valor > (subquery)",
            xpPenalty: 35,
        },
    ],
    database: {
        tables: [
            {
                name: "transacoes",
                description: "Registro de transações bancárias",
                columns: [
                    {
                        name: "id",
                        type: "INTEGER",
                        nullable: false,
                        primaryKey: true,
                        description: "ID da transação",
                    },
                    {
                        name: "conta",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Número da conta",
                    },
                    {
                        name: "valor",
                        type: "REAL",
                        nullable: false,
                        primaryKey: false,
                        description: "Valor da transação",
                    },
                    {
                        name: "descricao",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Descrição da transação",
                    },
                    {
                        name: "data",
                        type: "TEXT",
                        nullable: false,
                        primaryKey: false,
                        description: "Data da transação",
                    },
                ],
                sampleData: [
                    { id: 1, conta: "12345", valor: 150.00, descricao: "Compra supermercado", data: "2024-02-10" },
                    { id: 2, conta: "12346", valor: 5000.00, descricao: "Transferência", data: "2024-02-10" },
                    { id: 3, conta: "12347", valor: 80.00, descricao: "Pagamento conta", data: "2024-02-11" },
                    { id: 4, conta: "12345", valor: 12000.00, descricao: "Depósito suspeito", data: "2024-02-11" },
                    { id: 5, conta: "12348", valor: 200.00, descricao: "Compra online", data: "2024-02-12" },
                    { id: 6, conta: "12349", valor: 8500.00, descricao: "Saque elevado", data: "2024-02-12" },
                    { id: 7, conta: "12346", valor: 120.00, descricao: "Restaurante", data: "2024-02-13" },
                ],
            },
        ],
        relationships: [],
    },
    expectedOutput: {
        columns: ["conta", "valor", "descricao"],
        rows: [
            { conta: "12346", valor: 5000.00, descricao: "Transferência" },
            { conta: "12345", valor: 12000.00, descricao: "Depósito suspeito" },
            { conta: "12349", valor: 8500.00, descricao: "Saque elevado" },
        ],
    },
    testCases: [
        {
            id: "1",
            description: "Deve retornar transações acima da média",
            expectedResult: {
                columns: ["conta", "valor", "descricao"],
                rows: [
                    { conta: "12346", valor: 5000.00, descricao: "Transferência" },
                    { conta: "12345", valor: 12000.00, descricao: "Depósito suspeito" },
                    { conta: "12349", valor: 8500.00, descricao: "Saque elevado" },
                ],
            },
            weight: 100,
        },
    ],
};

// Map to access mysteries by ID
export const mysteryDetailsMap: Record<string, MysteryDetail> = {
    "1": mysteryDetail1,
    "2": mysteryDetail2,
    "3": mysteryDetail3,
    "4": mysteryDetail4,
};

// Helper function to get mystery by ID
export function getMysteryById(id: string): MysteryDetail | null {
    return mysteryDetailsMap[id] || null;
}