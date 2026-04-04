import { Desafio } from "../../src/service/core/domain/desafio.entity";
import { Capitulo } from "../../src/service/core/domain/capitulo.entity";
import { Objetivo } from "../../src/service/core/domain/objetivo.entity";
import { Dica } from "../../src/service/core/domain/dica.entity";
import { Consulta } from "../../src/service/core/domain/consulta.entity";
import { Visao } from "../../src/service/core/domain/visao.entity";
import { Log } from "../../src/service/core/domain/log.entity";
import { Ranking } from "../../src/service/core/domain/ranking.entity";
import { IUserView, IUserSignUp } from "../../src/service/core/domain/user.entity";

export const makeDesafio = (override: Partial<Desafio> = {}): Desafio =>
    new Desafio(
        override.id ?? 1,
        override.titulo ?? "Mistério do Mundo Mágico",
        override.descricao ?? "Um investigador é convocado para resolver uma conspiração.",
        override.tempoEstimado ?? "5 a 10 horas",
        override.taxaConclusao ?? 0,
        override.criadoEm ?? "2026-03-22T00:00:00.000Z",
        override.atualizadoEm ?? "2026-03-22T00:00:00.000Z"
    );

export const makeCapitulo = (override: Partial<Capitulo> = {}): Capitulo =>
    new Capitulo(
        override.id ?? 1,
        override.idDesafio ?? 1,
        override.introHistoria ?? "O mundo mágico vive sob a sombra do preconceito.",
        override.xp_recompensa ?? 100,
        override.contextoHistoria ?? "Mapeie as regiões e reinos do mundo mágico.",
        override.numero ?? 1
    );

export const makeObjetivo = (override: Partial<Objetivo> = {}): Objetivo =>
    new Objetivo(
        override.id ?? 1,
        override.idCapitulo ?? 1,
        override.descricao ?? "Identificar todas as regiões e reinos do mundo mágico.",
        override.ordem ?? 1,
        override.nivel ?? 0
    );

export const makeDica = (override: Partial<Dica> = {}): Dica =>
    new Dica(
        override.id ?? 1,
        override.idCapitulo ?? 1,
        override.ordem ?? 1,
        override.conteudo ?? 'Use a VIEW "regioes_reinos" para listar os reinos.',
        override.penalidadeXp ?? 10
    );

export const makeConsulta = (override: Partial<Consulta> = {}): Consulta =>
    new Consulta(
        override.id ?? 1,
        override.idCapitulo ?? 1,
        override.query ?? "SELECT * FROM regioes_reinos;",
        override.colunas ?? ["nome_reino", "geografia"],
        override.resultado ?? []
    );

export const makeVisao = (override: Partial<Visao> = {}): Visao =>
    new Visao(
        override.id ?? 1,
        override.idCapitulo ?? 1,
        override.comando ?? "regioes_reinos"
    );

export const makeLog = (override: Partial<Log> = {}): Log =>
    new Log(
        override.id ?? 1,
        override.tableName ?? "Desafio",
        override.operation ?? "INSERT",
        override.oldData ?? null,
        override.newData ?? { id: 1, titulo: "Mistério do Mundo Mágico" },
        override.changedBy ?? "admin",
        override.changedAt ?? "2026-03-22T00:00:00.000Z"
    );

export const makeRanking = (): Ranking =>
    new Ranking("rodrigo_macedo", "Macedo", "https://img.example.com/avatar.png", 1);

export const makeUserView = (override: Partial<IUserView> = {}): IUserView => ({
    uid: override.uid ?? "uid-test-123",
    username: override.username ?? "rodrigo_macedo",
    nick: override.nick ?? "Macedo",
    email: override.email ?? "teste@email.com",
    xp: override.xp ?? 0,
    rankingPosition: override.rankingPosition ?? 1,
    imagePerfil: override.imagePerfil ?? null,
    friends: override.friends ?? [],
    challenge_progress: override.challenge_progress ?? [],
    createdAt: override.createdAt ?? new Date("2026-03-22"),
    lastLogin: override.lastLogin ?? new Date("2026-04-04"),
});

export const makeUserSignUp = (override: Partial<IUserSignUp> = {}): IUserSignUp => ({
    username: override.username ?? "rodrigo_macedo",
    nick: override.nick ?? "Macedo",
    email: override.email ?? "teste@email.com",
    password: override.password ?? "Senha@123",
});
