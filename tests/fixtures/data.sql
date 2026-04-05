-- ============================================================
-- CI Test Data
-- Minimal dataset matching integration test expectations.
-- Run AFTER schema.sql.
-- ============================================================

TRUNCATE TABLE Log, Dica, Consulta, Objetivo, Visao, Capitulo, Desafio
    RESTART IDENTITY CASCADE;

-- Desafio
INSERT INTO Desafio (id, titulo, descricao, tempo_estimado, taxa_conclusao) VALUES
(1, 'Mistério do Mundo Mágico',
 'Um investigador é convocado para resolver uma conspiração que ameaça a paz entre os reinos.',
 '5 a 10 horas', 0);

-- Capítulos
INSERT INTO Capitulo (id, id_desafio, numero, intro_historia, contexto_historia, xp_recompensa) VALUES
(1, 1, 1, 'O mundo mágico vive sob a sombra do preconceito.', 'Mapeie as regiões e reinos do mundo mágico.', 100),
(2, 1, 2, 'Um grupo extremista de bruxos espalha o terror.', 'Mergulhe nos registros de ataques.', 200),
(3, 1, 3, 'Os Justiceiros não agem sozinhos.', 'Investigue as transações comerciais.', 300),
(4, 1, 4, 'O Sem Nome é o verdadeiro cérebro.', 'Conecte as ordens da Torre Mágica aos ataques.', 400),
(5, 1, 5, 'Um registro secreto em hexadecimal.', 'Encontre e decodifique o hexadecimal.', 500);

-- Objetivos (26 total)
INSERT INTO Objetivo (id, id_capitulo, descricao, ordem, nivel) VALUES
( 1, 1, 'Identificar todas as regiões e reinos do mundo mágico.', 1, 0),
( 2, 1, 'Listar as espécies que governam cada território.', 2, 0),
( 3, 1, 'Encontrar o nome dos Senhores das Terras.', 3, 0),
( 4, 1, 'Verificar quais territórios possuem artefatos lendários.', 4, 1),
( 5, 1, 'Explorar regiões com geografia Norte e Sul.', 5, 1),
( 6, 1, 'Identificar a pessoa mais antiga ainda viva.', 6, 2),
( 7, 2, 'Localizar registros de ataques dos Justiceiros.', 1, 2),
( 8, 2, 'Agrupar ataques por território.', 2, 2),
( 9, 2, 'Filtrar territórios com ataques acima da média.', 3, 4),
(10, 2, 'Identificar variação anual de ataques com LAG().', 4, 4),
(11, 2, 'Consultar vínculos suspeitos entre espécies.', 5, 0),
(12, 3, 'Mapear rotas de exportações e importações.', 1, 3),
(13, 3, 'Filtrar transações com pedras flamejantes.', 2, 3),
(14, 3, 'Localizar trocas de artefatos lendários.', 3, 3),
(15, 3, 'Listar personagens com acesso a minas.', 4, 3),
(16, 3, 'Investigar transações autorizadas cruzadas com ataques.', 5, 4),
(17, 4, 'Relacionar ataques de alto impacto com ordens da Torre.', 1, 4),
(18, 4, 'Calcular média de recursos usados por ano.', 2, 4),
(19, 4, 'Filtrar ataques cuja origem seja Val Nareth.', 3, 4),
(20, 4, 'Identificar aliados políticos do Senhor da Torre.', 4, 4),
(21, 4, 'Gerar ranking de territórios mais afetados.', 5, 4),
(22, 5, 'Recuperar o código hexadecimal da Torre Mágica.', 1, 1),
(23, 5, 'Decodificar o hexadecimal com ENCODE e DECODE.', 2, 4),
(24, 5, 'Encontrar ordens do Líder com a palavra-chave.', 3, 4),
(25, 5, 'Identificar o portador do Cajado do Coração de Fogo.', 4, 3),
(26, 5, 'Acessar o Grimório Primordial.', 5, 0);

-- Dicas (15 total — 3 por capítulo)
INSERT INTO Dica (id, id_capitulo, ordem, conteudo, penalidade_xp) VALUES
( 1, 1, 1, 'Use a VIEW "regioes_reinos" para listar os reinos.', 10),
( 2, 1, 2, 'A VIEW "senhores_das_terras" une Pessoa, Cidade e Feudo.', 25),
( 3, 1, 3, 'SELECT f.familiaFeudal, p.nome FROM Feudo f JOIN Cidade c ON f.id = c.id_feudo JOIN Pessoa p ON c.id_pessoa = p.id;', 50),
( 4, 2, 1, 'Filtre "ataques_raw" com WHERE autor = ''Os Justiceiros''.', 10),
( 5, 2, 2, 'Use GROUP BY sobre "ataques_detalhe" para contar ocorrências.', 25),
( 6, 2, 3, 'Crie uma CTE com EXTRACT(YEAR FROM data_ocorrido) e use LAG().', 50),
( 7, 3, 1, 'Comece filtrando WHERE recurso = ''pedras flamejantes''.', 10),
( 8, 3, 2, 'Use JOIN entre transacoes_base, Feudo e Pessoa.', 25),
( 9, 3, 3, 'SELECT p.nome, tc.recurso, a.data_ocorrido FROM Transacoes_Comerciais tc JOIN Pessoa p ON tc.id_senhor_autorizador = p.id JOIN Ataques a ON tc.id_territorio_destino = a.id_territorio WHERE a.data_ocorrido > tc.data_transacao;', 50),
(10, 4, 1, 'Filtre "ordens_torre_base" por id_territorio_alvo.', 10),
(11, 4, 2, 'Junte Torres_Magicas, Aliados_Politicos e Pessoa.', 25),
(12, 4, 3, 'SELECT p1.nome AS senhor, p2.nome AS aliado FROM Pessoa p1 JOIN Torres_Magicas tm ON p1.id = tm.id_senhor_da_torre JOIN aliancas_raw al ON p1.id = al.id_personagem1 JOIN Pessoa p2 ON al.id_personagem2 = p2.id;', 50),
(13, 5, 1, 'Use "registros_hex_raw" para encontrar o hexadecimal.', 10),
(14, 5, 2, 'SELECT ENCODE(DECODE(conteudo_hex, ''hex''), ''escape'') FROM registros_hex_raw;', 25),
(15, 5, 3, 'SELECT * FROM grimorio_final;', 50);

-- Visões (23 total)
INSERT INTO Visao (id, id_capitulo, comando) VALUES
( 1, 1, 'magical_world.regioes_reinos'),
( 2, 1, 'magical_world.especies_governantes'),
( 3, 1, 'magical_world.senhores_das_terras'),
( 4, 1, 'magical_world.artefatos_por_territorio'),
( 5, 1, 'magical_world.pessoas_vivas'),
( 6, 2, 'magical_world.ataques_raw'),
( 7, 2, 'magical_world.ataques_detalhe'),
( 8, 2, 'magical_world.vinculos_suspeitos'),
( 9, 3, 'magical_world.transacoes_base'),
(10, 3, 'magical_world.posse_artefatos_base'),
(11, 3, 'magical_world.mineracao_base'),
(12, 3, 'magical_world.ordens_torre_base'),
(13, 3, 'magical_world.recursos_ataques_base'),
(14, 3, 'magical_world.ataques_origem_recurso'),
(15, 3, 'magical_world.aliancas_raw'),
(16, 5, 'magical_world.registros_hex_raw'),
(17, 5, 'magical_world.ordens_emitidas_raw'),
(18, 5, 'magical_world.posse_artefato_personagem'),
(19, 5, 'magical_world.grimorio_final'),
(20, 4, 'magical_world.ordens_torre_base'),
(21, 4, 'magical_world.recursos_ataques_base'),
(22, 4, 'magical_world.ataques_origem_recurso'),
(23, 4, 'magical_world.aliancas_raw');

-- Consultas-solução (5 total — uma por capítulo)
INSERT INTO Consulta (id, id_capitulo, query, colunas, resultado) VALUES
(1, 1,
 'SELECT f.familiaFeudal AS nome_reino, f.geografia, p.nome AS nome_senhor, p.sobreNome AS sobrenome_senhor FROM Feudo f JOIN Cidade c ON f.id = c.id_feudo JOIN Pessoa p ON c.id_pessoa = p.id ORDER BY f.familiaFeudal;',
 '["nome_reino", "geografia", "nome_senhor", "sobrenome_senhor"]'::jsonb, NULL),
(2, 2,
 'WITH AtaquesPorAno AS (SELECT EXTRACT(YEAR FROM data_ocorrido) AS ano, COUNT(id) AS num_ataques FROM ataques_detalhe GROUP BY ano) SELECT ano, num_ataques, LAG(num_ataques, 1, 0) OVER (ORDER BY ano) AS ataques_ano_anterior, num_ataques - LAG(num_ataques, 1, 0) OVER (ORDER BY ano) AS variacao FROM AtaquesPorAno ORDER BY ano;',
 '["ano", "num_ataques", "ataques_ano_anterior", "variacao"]'::jsonb, NULL),
(3, 3,
 'SELECT p.nome AS senhor_autorizador, tc.recurso, a.data_ocorrido AS data_ataque FROM Transacoes_Comerciais tc JOIN Pessoa p ON tc.id_senhor_autorizador = p.id JOIN Ataques a ON tc.id_territorio_destino = a.id_territorio WHERE a.data_ocorrido > tc.data_transacao;',
 '["senhor_autorizador", "recurso", "data_ataque"]'::jsonb, NULL),
(4, 4,
 'SELECT p1.nome AS senhor_da_torre, p2.nome AS aliado FROM Pessoa p1 JOIN Torres_Magicas tm ON p1.id = tm.id_senhor_da_torre JOIN aliancas_raw al ON p1.id = al.id_personagem1 JOIN Pessoa p2 ON al.id_personagem2 = p2.id WHERE tm.nome = ''Torre Mágica de Val Nareth'';',
 '["senhor_da_torre", "aliado"]'::jsonb, NULL),
(5, 5,
 'SELECT * FROM grimorio_final;',
 '["conteudo"]'::jsonb, NULL);
