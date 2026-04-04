# Documentação de Testes — SQL Challenge Backend

## Sumário

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Pré-requisitos e Instalação](#pré-requisitos-e-instalação)
4. [Como Executar](#como-executar)
5. [Testes Unitários](#testes-unitários)
6. [Testes de Integração](#testes-de-integração)
7. [Testes E2E](#testes-e2e)
8. [Testes de Segurança](#testes-de-segurança)
9. [Helpers e Factories](#helpers-e-factories)
10. [Resultado Atual](#resultado-atual)

---

## Visão Geral

A suite de testes do SQL Challenge Backend cobre quatro camadas:

| Camada | Objetivo | Depende de banco? |
|--------|----------|------------------|
| **Unitário** | Valida a lógica isolada de cada use case e entidade, sem dependências externas | Não |
| **Integração** | Valida o comportamento conjunto de controller + use case + repository | Não (usa mocks) / Sim (repositories reais) |
| **E2E** | Valida os endpoints HTTP de ponta a ponta via supertest | Não (pool mockado) |
| **Segurança** | Valida CORS, SQL injection e proteção de dados sensíveis | Não |

A arquitetura do projeto segue Clean Architecture:

```
Rota HTTP → Controller → UseCase → Port (interface) → Repository → Banco
```

Os testes unitários isolam a camada de UseCase usando mocks do Port. Os demais testam integrações progressivamente maiores.

---

## Estrutura de Arquivos

```
tests/
├── helpers/
│   └── factories.ts                          ← fábrica de objetos para todos os testes
│
├── unit/
│   ├── domain/
│   │   └── entities.test.ts                  ← testa as 7 entidades de domínio
│   └── useCases/
│       ├── desafio.useCase.test.ts
│       ├── capitulo.useCase.test.ts
│       ├── objetivo.useCase.test.ts
│       ├── dica.useCase.test.ts
│       ├── consulta.useCase.test.ts
│       ├── visao.useCase.test.ts
│       ├── log.useCase.test.ts
│       ├── user.useCase.test.ts
│       └── ranking.useCase.test.ts
│
├── integration/
│   ├── controllers/
│   │   ├── capitulo.controller.test.ts
│   │   └── desafio.controller.test.ts
│   └── repositories/
│       └── postgres/
│           ├── desafio.postgres.repository.test.ts
│           ├── capitulo.postgres.repository.test.ts
│           ├── objetivo.postgres.repository.test.ts
│           ├── dica.postgres.repository.test.ts
│           ├── consulta.postgres.repository.test.ts
│           ├── visao.postgres.repository.test.ts
│           └── log.postgres.repository.test.ts
│
├── e2e/
│   ├── desafio.e2e.test.ts
│   ├── capitulo.e2e.test.ts
│   ├── objetivo.e2e.test.ts
│   ├── dica.e2e.test.ts
│   ├── consulta.e2e.test.ts
│   └── visao.e2e.test.ts
│
├── security/
│   ├── cors.security.test.ts
│   ├── injection.security.test.ts
│   └── auth.security.test.ts
│
└── TESTES.md                                 ← este arquivo
```

---

## Pré-requisitos e Instalação

### Dependências de teste (já instaladas)

```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```

| Pacote | Versão | Função |
|--------|--------|--------|
| `jest` | ^30.x | Framework de testes |
| `ts-jest` | ^29.x | Suporte a TypeScript no Jest |
| `@types/jest` | ^30.x | Tipagem do Jest |
| `supertest` | ^7.x | Simulação de requisições HTTP |
| `@types/supertest` | ^7.x | Tipagem do supertest |

### Configuração do Jest (`package.json`)

```json
"jest": {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/tests"],
  "testMatch": ["**/*.test.ts"],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/server/server.ts",
    "!src/service/db/**"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov"]
}
```

### Para testes de integração com banco real

Os testes de integração de repositories conectam no PostgreSQL. Configure as variáveis de ambiente:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=sua_senha
DB_NAME=db_gestao
```

O banco deve ter o DDL e DML aplicados:
```bash
psql -U admin -d db_gestao -f sql-challenge-modelagem_de_dados/PostgreSQL/Script/gestão/ddl_structure.sql
psql -U admin -d db_gestao -f sql-challenge-modelagem_de_dados/PostgreSQL/Script/cadastro_games/dml_magical_world.sql
```

---

## Como Executar

```bash
# Todos os testes
npm test

# Apenas testes unitários (não requerem banco)
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Apenas testes E2E
npm run test:e2e

# Apenas testes de segurança
npm run test:security

# Com relatório de cobertura
npm run test:coverage
```

---

## Testes Unitários

Localização: `tests/unit/`

Os testes unitários usam mocks de todas as dependências externas. Cada use case recebe um `jest.Mocked<IPort>` no construtor, garantindo isolamento total.

### entities.test.ts — Entidades de Domínio

Testa a criação correta de cada classe de domínio.

| Entidade | Casos testados |
|----------|---------------|
| `Desafio` | Criação com todos os campos |
| `Capitulo` | Campos incluindo `numero` e `xp_recompensa` |
| `Objetivo` | Campo `nivel` com valores 0, 2 e 4 (mínimo, médio e máximo) |
| `Dica` | `penalidadeXp` positiva e zero |
| `Consulta` | `query`, `colunas` e `resultado` preenchido e vazio |
| `Visao` | Campo `comando` com nome da view |
| `Log` | Operações INSERT (sem oldData), UPDATE (com ambos) e DELETE (sem newData) |

---

### desafio.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Retorna lista; retorna array vazio |
| `getById(id)` | Retorna desafio correto; propaga erro para ID inexistente |
| `getWithCapitulo(id, capId)` | Retorna objeto combinado; propaga erro quando não encontrado |

---

### capitulo.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Retorna lista; retorna array vazio |
| `getById(id)` | Retorna capítulo com `numero` correto; propaga erro |
| `getByDesafioId(id)` | Retorna 3 capítulos em ordem crescente; array vazio para desafio inexistente |

---

### objetivo.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Retorna objetivos com campo `nivel` preenchido |
| `getById(id)` | Campo `nivel` presente no retorno; propaga erro |
| `getByCapituloId(id)` | Todos do capítulo; `nivel` definido em todos; array vazio |

> Este use case tem teste específico para o campo `nivel` — era o bug identificado na análise de qualidade onde o repository não passava `row.nivel` ao construtor.

---

### dica.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Lista de dicas com `penalidadeXp` crescente |
| `getById(id)` | Retorna dica com `penalidadeXp` correto; propaga erro |
| `getByCapituloId(id)` | 3 dicas ordenadas; penalidades crescentes (10, 25, 50); array vazio |

---

### consulta.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Retorna lista |
| `getById(id)` | Retorna consulta com `query` SQL; retorna `null` para inexistente |
| `getByCapituloId(id)` | Retorna consulta-solução; array vazio |

---

### visao.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Lista com campo `comando`; array vazio |
| `getById(id)` | Retorna visão com `idCapitulo` e `comando` corretos; propaga erro |

---

### log.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Retorna logs com `operation` variada (INSERT/UPDATE/DELETE); array vazio |
| `getById(id)` | Log com `tableName`, `oldData` null e `newData` preenchido; propaga erro |

---

### user.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Lista de usuários |
| `getUserByUID(uid)` | Retorna usuário com UID correspondente |
| `getUsersByName(name)` | Retorna array filtrado por nome |
| `getUserByEmail(email)` | Retorna usuário pelo email |
| `addUser(user)` | Cadastro retorna `IUserView` com `uid` gerado |
| `loginWithEmail(email, psw)` | Autenticação válida; propaga erro em credenciais inválidas |
| `updateUser(partial)` | Retorna `true` em atualização bem-sucedida |
| `deleteUser(uid)` | Executa sem lançar erro |
| `logout(uid)` | Executa sem lançar erro |
| `resetPassword(uid, psw)` | Chamado com parâmetros corretos |

---

### ranking.useCase.test.ts

| Método | Casos testados |
|--------|---------------|
| `getAll()` | Retorna lista do ranking |
| `getRankingByUsername(username)` | Retorna entrada pelo username |
| `getRankingByNick(nick)` | Retorna entrada pelo nick |
| `getRankingByPosition(pos)` | Retorna jogador pela posição |
| `addRanking(ranking)` | Adiciona e retorna a entrada |
| `updatePositionByUsername(u, pos)` | Atualiza posição |
| `updatePositionByNick(nick, pos)` | Atualiza posição pelo nick |
| `updateImageByUsername(u, img)` | Atualiza URL da imagem |
| `deleteRanking(username)` | Remove sem lançar erro |

---

## Testes de Integração

Localização: `tests/integration/`

### Controllers

Testam o comportamento HTTP do controller com repositories mockados via `jest.mock()`.

#### capitulo.controller.test.ts

| Endpoint | Caso | Status esperado |
|----------|------|-----------------|
| `getAll` | Lista capítulos | 200 |
| `getById` | Capítulo existente | 200 |
| `getCapituloViewById` | Dados completos (capítulo + objetivos + dicas + consulta) | 200 |
| `getCapituloViewById` | ID não numérico (`abc`) | 400 |
| `getCapituloViewById` | Sem consulta-solução para o capítulo | 404 |

#### desafio.controller.test.ts

| Endpoint | Caso | Status esperado |
|----------|------|-----------------|
| `getAll` | Lista desafios | 200 |
| `getAll` | Erro no repositório | 500 |
| `getById` | Desafio existente | 200 |
| `getById` | ID inexistente | 500 |

---

### Repositories PostgreSQL

> Requerem banco ativo com dados do DML aplicado.

#### desafio.postgres.repository.test.ts

| Método | Caso | Verificação |
|--------|------|-------------|
| `getAll()` | Banco populado | Retorna ao menos 1 desafio com campos obrigatórios |
| `getById(1)` | Desafio existente | `titulo` = "Mistério do Mundo Mágico" |
| `getById(999999)` | Inexistente | Lança "Desafio não encontrado." |
| `getWithCapitulo(1,1)` | Combinação válida | `numero`=1, `xp_recompensa`=100 |
| `getWithCapitulo(1,999)` | Capítulo inválido | Lança "Desafio com capítulo não encontrado." |

#### capitulo.postgres.repository.test.ts

| Método | Caso | Verificação |
|--------|------|-------------|
| `getAll()` | — | Retorna exatamente 5 capítulos |
| `getAll()` | — | XPs = [100, 200, 300, 400, 500] |
| `getById(1)` | — | `numero`=1, `idDesafio`=1, `xp_recompensa`=100 |
| `getByDesafioId(1)` | — | 5 capítulos ordenados por número |
| `getByDesafioId(999)` | — | Array vazio |

#### objetivo.postgres.repository.test.ts

| Método | Caso | Verificação |
|--------|------|-------------|
| `getAll()` | — | Retorna exatamente 26 objetivos |
| `getAll()` | — | Todos com campo `nivel` do tipo `number` |
| `getById(6)` | Objetivo do cap 1, nível 2 | `nivel` = 2 |
| `getByCapituloId(1)` | — | 6 objetivos, `ordem` de 1 a 6 |
| `getByCapituloId(1)` | — | Contém níveis 0, 1 e 2 |

#### dica.postgres.repository.test.ts

| Método | Caso | Verificação |
|--------|------|-------------|
| `getAll()` | — | 15 dicas (3 × 5 capítulos) |
| `getAll()` | — | `penalidadeXp` sempre ≥ 0 |
| `getById(1)` | — | `penalidadeXp`=10, `ordem`=1 |
| `getByCapituloId(1)` | — | 3 dicas com penalidades 10, 25, 50 |

#### consulta.postgres.repository.test.ts

| Método | Caso | Verificação |
|--------|------|-------------|
| `getAll()` | — | 5 consultas (1 por capítulo) |
| `getById(1)` | — | `query` contém "Feudo" |
| `getById(999)` | — | Retorna `null` |
| `getByCapituloId(1)` | — | `colunas` contém "nome_reino" |

#### visao.postgres.repository.test.ts

| Método | Caso | Verificação |
|--------|------|-------------|
| `getAll()` | — | Visões com `comando` e `idCapitulo` preenchidos |
| `getAll()` | — | Contém "regioes_reinos" no capítulo 1 |
| `getById(1)` | — | `comando` = "regioes_reinos" |
| `getById(999)` | — | Lança "Visão não encontrada!" |

#### log.postgres.repository.test.ts

| Método | Caso | Verificação |
|--------|------|-------------|
| `getAll()` | — | Array com campos obrigatórios |
| `getAll()` | — | `operation` sempre INSERT, UPDATE ou DELETE |
| `getById(999999)` | — | Lança "Log não encontrado." |

---

## Testes E2E

Localização: `tests/e2e/`

Sobem o app Express completo via `supertest`. O `pool` do PostgreSQL é mockado para não precisar de banco rodando, permitindo execução em CI/CD.

```typescript
jest.mock("../../src/service/db/postgresql/postgresqlConfig", () => ({
    pool: { query: jest.fn(), end: jest.fn() },
}));
```

### desafio.e2e.test.ts — `GET /api/desafios`

| Requisição | Caso | Status | Verificação |
|------------|------|--------|-------------|
| `GET /api/desafios` | Banco retorna 1 desafio | 200 | `body[0].titulo` = "Mistério do Mundo Mágico" |
| `GET /api/desafios/1` | ID existente | 200 | `body.id` = 1 |
| `GET /api/desafios/999` | Banco retorna vazio | 500 | — |

### capitulo.e2e.test.ts — `GET /api/capitulo`

| Requisição | Caso | Status | Verificação |
|------------|------|--------|-------------|
| `GET /api/capitulo` | — | 200 | Array |
| `GET /api/capitulo/1` | — | 200 | `body.numero` = 1 |
| `GET /api/capitulo/view/abc` | ID inválido | 400 | — |
| `GET /api/capitulo/view/1` | Dados completos | 200 | `data` com capitulo, objetivos, dicas, consultaSolucao |

### objetivo.e2e.test.ts — `GET /api/objetivos`

| Requisição | Caso | Status | Verificação |
|------------|------|--------|-------------|
| `GET /api/objetivos` | — | 200 | `body[0].nivel` definido |
| `GET /api/objetivos/1` | — | 200 | `nivel` = 0 |
| `GET /api/objetivos/999` | Banco vazio | 500 | — |

### dica.e2e.test.ts — `GET /api/dicas`

| Requisição | Caso | Status | Verificação |
|------------|------|--------|-------------|
| `GET /api/dicas` | — | 200 | 3 dicas |
| `GET /api/dicas/1` | — | 200 | `penalidadeXp` = 10 |
| `GET /api/dicas/capitulo/1` | — | 200 | 3 dicas |

### consulta.e2e.test.ts — `GET /api/consultas`

| Requisição | Caso | Status | Verificação |
|------------|------|--------|-------------|
| `GET /api/consultas` | — | 200 | Array |
| `GET /api/consultas/1` | — | 200 | `query` contém "SELECT" |
| `GET /api/consultas/999` | Banco vazio | 500 | — |

### visao.e2e.test.ts — Visao Repository direto

| Caso | Verificação |
|------|-------------|
| `getAll()` com 2 visões mockadas | `comando` = "regioes_reinos", `idCapitulo` = 1 |
| `getById(1)` | `id` = 1, `comando` = "regioes_reinos" |
| `getById(999)` com banco vazio | Lança "Visão não encontrada!" |

---

## Testes de Segurança

Localização: `tests/security/`

### cors.security.test.ts

| Caso | Verificação |
|------|-------------|
| Requisição com `Origin: http://localhost:3000` | Header `Access-Control-Allow-Origin` presente |
| Preflight `OPTIONS /api/desafios` | Status 200 ou 204 |
| Resposta da API | Header `X-Powered-By` ausente (não expõe stack tecnológico) |

### injection.security.test.ts

Verifica que a API não executa SQL malicioso injetado via parâmetros de URL.

| Payload testado | Comportamento esperado |
|-----------------|----------------------|
| `GET /api/desafios/1; DROP TABLE Desafio;--` | Status 400, 404 ou 500 — nunca 200 |
| `GET /api/capitulo/1 OR 1=1` | Status não 200 |
| `GET /api/objetivos/' UNION SELECT * FROM Log--` | Status não 200 |
| `GET /api/desafios/-1` | Erro sem expor `stack` no body |
| `GET /api/desafios/999999999999999999` | Status 400, 404 ou 500 |
| Qualquer `GET /:id` com ID válido | `pool.query` chamado com 2 argumentos (query + array de params) |

> O último teste confirma que os repositories usam **queries parametrizadas** (`$1`, `$2`...) em vez de concatenação de string, que é a principal proteção contra SQL injection.

### auth.security.test.ts

| Caso | Verificação |
|------|-------------|
| `GET /api/desafios` sem token | Acessível (rota pública) — status 200 ou 500 |
| `GET /api/capitulo` sem token | Acessível (rota pública) |
| Erro interno do banco | Body não contém `stack`, `password` ou `pg` |
| Resposta qualquer | Body não contém campos `password` ou `senha` |
| Header da resposta | `X-Powered-By` ausente |

---

## Helpers e Factories

Localização: `tests/helpers/factories.ts`

Funções de fábrica que criam objetos de domínio com valores padrão realistas (baseados nos dados do DML do Mundo Mágico). Todos aceitam um objeto `override` para sobrescrever campos específicos.

```typescript
makeDesafio(override?)    // Desafio id=1, "Mistério do Mundo Mágico"
makeCapitulo(override?)   // Capitulo id=1, numero=1, xp_recompensa=100
makeObjetivo(override?)   // Objetivo id=1, ordem=1, nivel=0
makeDica(override?)       // Dica id=1, penalidadeXp=10
makeConsulta(override?)   // Consulta id=1, query="SELECT * FROM regioes_reinos;"
makeVisao(override?)      // Visao id=1, comando="regioes_reinos"
makeLog(override?)        // Log id=1, operation="INSERT"
makeRanking()             // Ranking username="rodrigo_macedo"
makeUserView(override?)   // IUserView com uid, username, email etc.
makeUserSignUp(override?) // IUserSignUp para testes de cadastro
```

**Exemplo de uso com override:**

```typescript
// Cria objetivo do capítulo 2 com nível 4
const obj = makeObjetivo({ idCapitulo: 2, nivel: 4, ordem: 3 });

// Cria dica com penalidade máxima
const dica = makeDica({ penalidadeXp: 50, ordem: 3 });
```

---

## Resultado Atual

```
Test Suites: 10 passed
Tests:       68 passed
Time:        ~5.8s
```

### Cobertura dos testes unitários por módulo

| Módulo | Use Cases cobertos | Entidades cobertas |
|--------|--------------------|--------------------|
| Desafio | getAll, getById, getWithCapitulo | Desafio |
| Capítulo | getAll, getById, getByDesafioId | Capitulo |
| Objetivo | getAll, getById, getByCapituloId | Objetivo |
| Dica | getAll, getById, getByCapituloId | Dica |
| Consulta | getAll, getById, getByCapituloId | Consulta |
| Visão | getAll, getById | Visao |
| Log | getAll, getById | Log |
| User | getAll, getByUID, getByName, getByEmail, add, login, logout, reset, update, delete | — |
| Ranking | getAll, getByUsername, getByNick, getByPosition, add, updatePosition, updateImage, delete | Ranking |

### Observações

- Testes de integração de **repositories** requerem banco PostgreSQL ativo com DML aplicado.
- Testes de integração de **firebase** (User e Ranking repositories) não foram incluídos pois dependem de credenciais de serviço reais — recomenda-se usar Firebase Emulator localmente.
- Os testes E2E e de segurança são totalmente autossuficientes (banco mockado).
