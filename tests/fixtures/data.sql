-- ============================================================
-- CI Test Data + Game Content
-- Complete dataset: 1 desafio, 5 capítulos, 26 objetivos,
-- 15 dicas, 23 visões, 26 consultas-solução.
-- Source: sql-challenge-modelagem_de_dados/PostgreSQL/Script/
--         cadastro_games/dml_magical_world.sql
-- ============================================================

TRUNCATE TABLE Log, Dica, Consulta, Objetivo, Visao, Capitulo, Desafio
    RESTART IDENTITY CASCADE;

-- ============================================================
-- DESAFIO
-- ============================================================
INSERT INTO Desafio (id, titulo, descricao, tempo_estimado, taxa_conclusao) VALUES
(1,
 'Mistério do Mundo Mágico',
 'Um investigador é convocado para resolver uma conspiração que ameaça a paz entre os reinos. '
 'Ao longo de 5 capítulos, você usará SQL para mapear territórios, rastrear recursos, '
 'identificar traidores e decifrar segredos codificados — até revelar a verdade oculta no Grimório Primordial.',
 '5 a 10 horas',
 0);

-- ============================================================
-- CAPÍTULOS
-- ============================================================
INSERT INTO Capitulo (id, id_desafio, numero, intro_historia, contexto_historia, xp_recompensa) VALUES

(1, 1, 1,
 'O mundo mágico vive sob a sombra do preconceito e da desconfiança, '
 'um caos alimentado por lendas e guerras antigas. Como investigador '
 'encarregado de restaurar a paz, você recebe sua primeira missão.',
 'Mapeie as regiões e reinos do mundo mágico. Identifique as espécies que governam cada '
 'território, os Senhores das Terras nomeados pela realeza e os artefatos lendários que são '
 'pivô de muitos conflitos. As evidências estão nas visões do banco — consulte-as com cuidado.',
 100),

(2, 1, 2,
 'Um grupo extremista de bruxos, autointitulado "Os Justiceiros", está espalhando o terror '
 'com atentados brutais — incluindo a explosão de uma Academia Mágica. '
 'Para combatê-los, é preciso entender seu padrão de operação.',
 'Mergulhe nos registros de ataques atribuídos ao grupo. Analise onde atacam, '
 'com que frequência e se há variação ao longo do tempo. '
 'Encontre o epicentro das atividades dos Justiceiros agrupando e contando os dados.',
 200),

(3, 1, 3,
 'Ataques dessa magnitude exigem planejamento, recursos e cúmplices. '
 'Os Justiceiros não agem sozinhos. Siga o rastro das "pedras flamejantes" '
 'usadas em seus explosivos — alguém está financiando a conspiração.',
 'Investigue as transações comerciais entre territórios. Identifique rotas de suprimento, '
 'quem autoriza as movimentações de recursos e como os artefatos lendários trocam de mãos. '
 'As pistas estão espalhadas por múltiplas fontes — conecte-as.',
 300),

(4, 1, 4,
 'As pistas apontam para um único nome — ou melhor, para um indivíduo que não tem nome. '
 '"O Sem Nome", Senhor da Torre Mágica de Val Nareth, é o verdadeiro cérebro da conspiração. '
 'Mas provar isso exige evidências sólidas.',
 'Conecte as ordens emitidas pela Torre Mágica de Val Nareth aos ataques dos Justiceiros. '
 'Identifique os aliados do Senhor da Torre e exponha a hierarquia da conspiração. '
 'A rede de cumplicidade é profunda — desvendá-la exige cruzar múltiplas camadas de dados.',
 400),

(5, 1, 5,
 'Com a captura do líder dos Justiceiros, uma pista enigmática é descoberta: '
 'um registro secreto codificado em hexadecimal nos arquivos da Torre de Val Nareth. '
 'Este código é a chave para a verdade final.',
 'Encontre o registro hexadecimal, decodifique-o para obter a palavra-chave secreta '
 'e use essa informação para localizar o perdido Grimório Primordial. '
 'O Grimório contém a história completa da conspiração.',
 500);

-- ============================================================
-- VISÕES DISPONÍVEIS POR CAPÍTULO
-- ============================================================
INSERT INTO Visao (id, id_capitulo, comando) VALUES
-- Capítulo 1: mapeamento do mundo
( 1, 1, 'magical_world.regioes_reinos'),
( 2, 1, 'magical_world.especies_governantes'),
( 3, 1, 'magical_world.senhores_das_terras'),
( 4, 1, 'magical_world.artefatos_por_territorio'),
( 5, 1, 'magical_world.pessoas_vivas'),
-- Capítulo 2: investigação dos ataques
( 6, 2, 'magical_world.ataques_raw'),
( 7, 2, 'magical_world.ataques_detalhe'),
( 8, 2, 'magical_world.vinculos_suspeitos'),
-- Capítulo 3: rastreamento de recursos e conspirações
( 9, 3, 'magical_world.transacoes_base'),
(10, 3, 'magical_world.posse_artefatos_base'),
(11, 3, 'magical_world.mineracao_base'),
(12, 3, 'magical_world.ordens_torre_base'),
(13, 3, 'magical_world.recursos_ataques_base'),
(14, 3, 'magical_world.ataques_origem_recurso'),
(15, 3, 'magical_world.aliancas_raw'),
-- Capítulo 4: reutiliza views do capítulo 3
(20, 4, 'magical_world.ordens_torre_base'),
(21, 4, 'magical_world.recursos_ataques_base'),
(22, 4, 'magical_world.ataques_origem_recurso'),
(23, 4, 'magical_world.aliancas_raw'),
-- Capítulo 5: desvendando o grimório
(16, 5, 'magical_world.registros_hex_raw'),
(17, 5, 'magical_world.ordens_emitidas_raw'),
(18, 5, 'magical_world.posse_artefato_personagem'),
(19, 5, 'magical_world.grimorio_final');

-- ============================================================
-- OBJETIVOS POR CAPÍTULO
-- ============================================================

INSERT INTO Objetivo (id, id_capitulo, descricao, ordem, nivel) VALUES
(1, 1, 'Identificar todas as regiões e reinos do mundo mágico listados no banco de dados.', 1, 0),
(2, 1, 'Listar as espécies que governam cada território.', 2, 0),
(3, 1, 'Encontrar o nome e sobrenome dos Senhores das Terras de cada território.', 3, 0),
(4, 1, 'Verificar quais territórios possuem ligação com artefatos da categoria Lendário (''L'').', 4, 1),
(5, 1, 'Explorar as regiões com geografia Norte (''N'') e Sul (''S'').', 5, 1),
(6, 1, 'Identificar a pessoa mais antiga ainda viva, obtendo seu nome e idade calculada.', 6, 2);

INSERT INTO Objetivo (id, id_capitulo, descricao, ordem, nivel) VALUES
(7,  2, 'Encontrar os ataques cujo autor é "Os Justiceiros".', 1, 1),
(8,  2, 'Contar quantos ataques ocorreram em cada território.', 2, 2),
(9,  2, 'Contar o total de ataques agrupados por autor.', 3, 2),
(10, 2, 'Combinar as informações de autor e território em uma única consulta.', 4, 3),
(11, 2, 'Cruzar vínculos suspeitos com os territórios atacados e contar as ocorrências.', 5, 3);

INSERT INTO Objetivo (id, id_capitulo, descricao, ordem, nivel) VALUES
(12, 3, 'Identificar personagens que possuem artefatos e têm acesso a minas.', 1, 3),
(13, 3, 'Cruzar transações de pedras flamejantes com ataques ao território de destino.', 2, 3),
(14, 3, 'Relacionar ordens da Torre Mágica com ataques registrados no mesmo território.', 3, 3),
(15, 3, 'Listar minerações de pedras flamejantes e a quantidade total por mina.', 4, 3),
(16, 3, 'Calcular quantos ataques e recursos atingiram cada território que recebeu transações.', 5, 4);

INSERT INTO Objetivo (id, id_capitulo, descricao, ordem, nivel) VALUES
(17, 4, 'Encontrar ordens da Torre ligadas a ataques com uso de recursos acima da média.', 1, 4),
(18, 4, 'Somar recursos e contar ataques por território de origem.', 2, 4),
(19, 4, 'Cruzar a origem dos recursos com o volume de ataques em cada território.', 3, 4),
(20, 4, 'Identificar o personagem com mais alianças.', 4, 4),
(21, 4, 'Calcular o total de ataques e recursos movimentados por cada torre.', 5, 4);

INSERT INTO Objetivo (id, id_capitulo, descricao, ordem, nivel) VALUES
(22, 5, 'Recuperar o registro secreto armazenado pela Torre Mágica de Val Nareth.', 1, 1),
(23, 5, 'Explorar todos os registros secretos disponíveis no banco de dados.', 2, 0),
(24, 5, 'Cruzar ordens emitidas com o portador de cada artefato.', 3, 3),
(25, 5, 'Identificar o portador atual do Cajado do Coração de Fogo.', 4, 1),
(26, 5, 'Acessar o Grimório Primordial e revelar a verdade completa sobre a conspiração.', 5, 0);

-- ============================================================
-- DICAS POR CAPÍTULO
-- ============================================================

INSERT INTO Dica (id, id_capitulo, ordem, conteudo, penalidade_xp) VALUES
(1, 1, 1,
 'Use a VIEW "regioes_reinos" para listar os reinos e geografias. '
 'Experimente: SELECT * FROM regioes_reinos;',
 10),
(2, 1, 2,
 'A VIEW "senhores_das_terras" já une Pessoa, Cidade e Feudo. '
 'Combine-a com "regioes_reinos" para enriquecer o resultado.',
 25),
(3, 1, 3,
 'Query completa: SELECT f.familiaFeudal AS nome_reino, f.geografia, '
 'p.nome AS nome_senhor, p.sobreNome AS sobrenome_senhor '
 'FROM Feudo f JOIN Cidade c ON f.id = c.id_feudo '
 'JOIN Pessoa p ON c.id_pessoa = p.id ORDER BY f.familiaFeudal;',
 50);

INSERT INTO Dica (id, id_capitulo, ordem, conteudo, penalidade_xp) VALUES
(4, 2, 1,
 'Filtre a VIEW "ataques_raw" com WHERE autor = ''Os Justiceiros'' '
 'para ver apenas os ataques do grupo.',
 10),
(5, 2, 2,
 'Use GROUP BY sobre "ataques_detalhe" para agrupar por territorio_atacado '
 'e COUNT(id) para contar ocorrências. Adicione HAVING COUNT(id) > média para filtrar.',
 25),
(6, 2, 3,
 'Para variação anual, crie uma CTE: WITH AtaquesPorAno AS (SELECT EXTRACT(YEAR FROM data_ocorrido) '
 'AS ano, COUNT(id) AS num_ataques FROM ataques_detalhe GROUP BY ano) '
 'SELECT ano, num_ataques, LAG(num_ataques, 1, 0) OVER (ORDER BY ano) AS ataques_ano_anterior, '
 'num_ataques - LAG(num_ataques, 1, 0) OVER (ORDER BY ano) AS variacao FROM AtaquesPorAno ORDER BY ano;',
 50);

INSERT INTO Dica (id, id_capitulo, ordem, conteudo, penalidade_xp) VALUES
(7, 3, 1,
 'Comece filtrando Transacoes_Comerciais pelo campo recurso: '
 'SELECT * FROM Transacoes_Comerciais WHERE recurso = ''pedras flamejantes'';',
 10),
(8, 3, 2,
 'Para rastrear quem autorizou as transações, use JOIN entre transacoes_base, '
 'Feudo (origem e destino) e Pessoa (id_senhor_autorizador).',
 25),
(9, 3, 3,
 'Para cruzar transações com ataques posteriores: '
 'SELECT p.nome AS senhor_autorizador, tc.recurso, a.data_ocorrido AS data_ataque '
 'FROM Transacoes_Comerciais tc '
 'JOIN Pessoa p ON tc.id_senhor_autorizador = p.id '
 'JOIN Ataques a ON tc.id_territorio_destino = a.id_territorio '
 'WHERE a.data_ocorrido > tc.data_transacao;',
 50);

INSERT INTO Dica (id, id_capitulo, ordem, conteudo, penalidade_xp) VALUES
(10, 4, 1,
 'A VIEW "ordens_torre_base" contém ordens da Torre Mágica. '
 'Filtre por id_territorio_alvo para cruzar com ataques de alto impacto (nivel_impacto > 8).',
 10),
(11, 4, 2,
 'Para encontrar aliados do Senhor da Torre, junte Torres_Magicas, Aliados_Politicos e Pessoa. '
 'Filtre WHERE tm.nome = ''Torre Mágica de Val Nareth''.',
 25),
(12, 4, 3,
 'Query dos aliados: SELECT p1.nome AS senhor_da_torre, p2.nome AS aliado '
 'FROM Pessoa p1 '
 'JOIN Torres_Magicas tm ON p1.id = tm.id_senhor_da_torre '
 'JOIN aliancas_raw al ON p1.id = al.id_personagem1 '
 'JOIN Pessoa p2 ON al.id_personagem2 = p2.id '
 'WHERE tm.nome = ''Torre Mágica de Val Nareth'';',
 50);

INSERT INTO Dica (id, id_capitulo, ordem, conteudo, penalidade_xp) VALUES
(13, 5, 1,
 'Use a VIEW "registros_hex_raw" para encontrar o hexadecimal: '
 'SELECT conteudo_hex FROM registros_hex_raw WHERE nome_torre = ''Torre Mágica de Val Nareth'';',
 10),
(14, 5, 2,
 'Decodifique o hexadecimal com: '
 'SELECT ENCODE(DECODE(conteudo_hex, ''hex''), ''escape'') AS palavra_chave '
 'FROM registros_hex_raw WHERE nome_torre = ''Torre Mágica de Val Nareth'';',
 25),
(15, 5, 3,
 'Query completa do Cap 5: '
 'SELECT * FROM ordens_emitidas_raw '
 'WHERE conteudo_ordem LIKE ''%'' || '
 '(SELECT ENCODE(DECODE(conteudo_hex,''hex''),''escape'') '
 ' FROM registros_hex_raw WHERE nome_torre = ''Torre Mágica de Val Nareth'' LIMIT 1) '
 '|| ''%'' '
 'AND id_emissor = (SELECT id FROM Pessoa WHERE nome || '' '' || sobreNome = ''Líder dos Justiceiros''); '
 'Depois: SELECT * FROM grimorio_final;',
 50);

-- ============================================================
-- CONSULTAS-SOLUÇÃO POR OBJETIVO
-- Uma consulta por objetivo.
-- ============================================================

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(1, 1, 1,
 'SELECT * FROM regioes_reinos;',
 ARRAY['nome_reino', 'geografia'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(2, 1, 2,
 'SELECT * FROM especies_governantes;',
 ARRAY['especie_governante'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(3, 1, 3,
 'SELECT * FROM senhores_das_terras;',
 ARRAY['nome_senhor', 'sobrenome_senhor', 'territorio_governado'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(4, 1, 4,
 'SELECT * FROM artefatos_por_territorio WHERE categoria = ''L'';',
 ARRAY['nome_artefato', 'categoria', 'territorio_localizacao'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(5, 1, 5,
 'SELECT * FROM regioes_reinos WHERE geografia = ''N'' OR geografia = ''S'';',
 ARRAY['nome_reino', 'geografia'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(6, 1, 6,
 'SELECT * FROM pessoas_vivas ORDER BY nascimento ASC LIMIT 1;',
 ARRAY['nome', 'sobreNome', 'nascimento', 'óbito'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(7, 2, 7,
 'SELECT * FROM ataques_raw WHERE autor = ''Os Justiceiros'';',
 ARRAY['data_ocorrido', 'autor', 'id_territorio'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(8, 2, 8,
 'SELECT territorio_atacado, COUNT(*) AS total_ataques '
 'FROM ataques_detalhe '
 'GROUP BY territorio_atacado '
 'ORDER BY total_ataques DESC;',
 ARRAY['territorio_atacado', 'total_ataques'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(9, 2, 9,
 'SELECT autor, COUNT(*) AS total_ataques '
 'FROM ataques_raw '
 'GROUP BY autor '
 'ORDER BY total_ataques DESC;',
 ARRAY['autor', 'total_ataques'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(10, 2, 10,
 'SELECT ar.data_ocorrido, ar.autor, ad.territorio_atacado '
 'FROM ataques_raw ar '
 'JOIN ataques_detalhe ad ON ar.data_ocorrido = ad.data_ocorrido '
 'WHERE ar.autor = ''Os Justiceiros'';',
 ARRAY['data_ocorrido', 'autor', 'territorio_atacado'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(11, 2, 11,
 'SELECT vs.especie_associada, vs.territorio_associado, COUNT(ad.id) AS total_ataques '
 'FROM vinculos_suspeitos vs '
 'JOIN ataques_detalhe ad ON vs.territorio_associado = ad.territorio_atacado '
 'GROUP BY vs.especie_associada, vs.territorio_associado '
 'ORDER BY total_ataques DESC;',
 ARRAY['especie_associada', 'territorio_associado', 'total_ataques'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(12, 3, 12,
 'SELECT pa.nome_artefato, pa.categoria, m.recurso_principal '
 'FROM posse_artefatos_base pa '
 'JOIN mineracao_base m ON pa.id_personagem_portador = m.id_pessoa;',
 ARRAY['nome_artefato', 'categoria', 'recurso_principal'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(13, 3, 13,
 'SELECT tb.recurso, tb.id_territorio_origem, tb.id_territorio_destino, rab.quantidade_recursos '
 'FROM transacoes_base tb '
 'JOIN recursos_ataques_base rab ON tb.id_territorio_destino = rab.id_territorio '
 'WHERE tb.recurso = ''pedras flamejantes'';',
 ARRAY['recurso', 'id_territorio_origem', 'id_territorio_destino', 'quantidade_recursos'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(14, 3, 14,
 'SELECT otb.descricao_ordem, otb.data_emissao, rab.data_ocorrido, rab.quantidade_recursos '
 'FROM ordens_torre_base otb '
 'JOIN recursos_ataques_base rab ON otb.id_territorio_alvo = rab.id_territorio;',
 ARRAY['descricao_ordem', 'data_emissao', 'data_ocorrido', 'quantidade_recursos'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(15, 3, 15,
 'SELECT m.id_mina, m.recurso_principal, tb.recurso AS recurso_transacao '
 'FROM mineracao_base m '
 'JOIN transacoes_base tb ON m.id_pessoa = tb.id_senhor_autorizador '
 'WHERE m.recurso_principal = ''pedras flamejantes'';',
 ARRAY['id_mina', 'recurso_principal', 'recurso_transacao'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(16, 3, 16,
 'SELECT tb.id_territorio_destino, '
 'COUNT(rab.id_territorio) AS total_ataques, '
 'SUM(rab.quantidade_recursos) AS total_recursos '
 'FROM transacoes_base tb '
 'JOIN recursos_ataques_base rab ON tb.id_territorio_destino = rab.id_territorio '
 'GROUP BY tb.id_territorio_destino '
 'ORDER BY total_ataques DESC;',
 ARRAY['id_territorio_destino', 'total_ataques', 'total_recursos'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(17, 4, 17,
 'SELECT otb.descricao_ordem, otb.data_emissao, rab.data_ocorrido, rab.quantidade_recursos '
 'FROM ordens_torre_base otb '
 'JOIN recursos_ataques_base rab ON otb.id_territorio_alvo = rab.id_territorio '
 'WHERE rab.quantidade_recursos > ('
 '  SELECT AVG(quantidade_recursos) FROM recursos_ataques_base'
 ') '
 'ORDER BY rab.quantidade_recursos DESC;',
 ARRAY['descricao_ordem', 'data_emissao', 'data_ocorrido', 'quantidade_recursos'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(18, 4, 18,
 'SELECT aor.territorio_origem_recurso, '
 'COUNT(*) AS total_ataques, '
 'SUM(rab.quantidade_recursos) AS total_recursos '
 'FROM ataques_origem_recurso aor '
 'JOIN recursos_ataques_base rab ON aor.data_ocorrido = rab.data_ocorrido '
 'GROUP BY aor.territorio_origem_recurso '
 'ORDER BY total_ataques DESC;',
 ARRAY['territorio_origem_recurso', 'total_ataques', 'total_recursos'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(19, 4, 19,
 'SELECT aor.territorio_origem_recurso, aor.recurso_principal_usado, rab.quantidade_recursos '
 'FROM ataques_origem_recurso aor '
 'JOIN recursos_ataques_base rab ON aor.data_ocorrido = rab.data_ocorrido '
 'WHERE aor.territorio_origem_recurso LIKE ''%Val%'';',
 ARRAY['territorio_origem_recurso', 'recurso_principal_usado', 'quantidade_recursos'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(20, 4, 20,
 'SELECT id_personagem1, COUNT(id_personagem2) AS total_aliados '
 'FROM aliancas_raw '
 'GROUP BY id_personagem1 '
 'HAVING COUNT(id_personagem2) = ('
 '  SELECT MAX(cnt) FROM ('
 '    SELECT COUNT(id_personagem2) AS cnt FROM aliancas_raw GROUP BY id_personagem1'
 '  ) sub'
 ');',
 ARRAY['id_personagem1', 'total_aliados'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(21, 4, 21,
 'SELECT otb.id_torre, '
 'COUNT(rab.id_territorio) AS total_ataques, '
 'SUM(rab.quantidade_recursos) AS total_recursos '
 'FROM ordens_torre_base otb '
 'JOIN recursos_ataques_base rab ON otb.id_territorio_alvo = rab.id_territorio '
 'GROUP BY otb.id_torre '
 'ORDER BY total_ataques DESC;',
 ARRAY['id_torre', 'total_ataques', 'total_recursos'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(22, 5, 22,
 'SELECT * FROM registros_hex_raw '
 'WHERE nome_torre = ''Torre Mágica de Val Nareth'';',
 ARRAY['conteudo_hex', 'nome_torre'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(23, 5, 23,
 'SELECT * FROM registros_hex_raw;',
 ARRAY['conteudo_hex', 'nome_torre'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(24, 5, 24,
 'SELECT oer.conteudo_ordem, pac.nome_portador, pac.nome_artefato '
 'FROM ordens_emitidas_raw oer '
 'JOIN posse_artefato_personagem pac ON oer.id_emissor = pac.id_artefato;',
 ARRAY['conteudo_ordem', 'nome_portador', 'nome_artefato'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(25, 5, 25,
 'SELECT * FROM posse_artefato_personagem '
 'WHERE nome_artefato = ''Cajado do Coração de Fogo'';',
 ARRAY['id_artefato', 'nome_portador', 'sobrenome_portador', 'nome_artefato'],
 NULL);

INSERT INTO Consulta (id, id_capitulo, id_objetivo, query, colunas, resultado) VALUES
(26, 5, 26,
 'SELECT * FROM grimorio_final;',
 ARRAY['conteudo'],
 NULL);
