import { Desafio } from "../../../src/service/core/domain/desafio.entity";
import { Capitulo } from "../../../src/service/core/domain/capitulo.entity";
import { Objetivo } from "../../../src/service/core/domain/objetivo.entity";
import { Dica } from "../../../src/service/core/domain/dica.entity";
import { Consulta } from "../../../src/service/core/domain/consulta.entity";
import { Visao } from "../../../src/service/core/domain/visao.entity";
import { Log } from "../../../src/service/core/domain/log.entity";

describe("Entidades de Domínio", () => {

    describe("Desafio", () => {
        it("deve criar instância com todos os campos", () => {
            const d = new Desafio(1, "Mistério do Mundo Mágico", "Descrição", "5h", 0, "2026-03-22", "2026-03-22");

            expect(d.id).toBe(1);
            expect(d.titulo).toBe("Mistério do Mundo Mágico");
            expect(d.tempoEstimado).toBe("5h");
            expect(d.taxaConclusao).toBe(0);
        });
    });

    describe("Capitulo", () => {
        it("deve criar instância com todos os campos incluindo numero", () => {
            const c = new Capitulo(1, 1, "Intro", 100, "Contexto", 1);

            expect(c.id).toBe(1);
            expect(c.idDesafio).toBe(1);
            expect(c.xpRecompensa).toBe(100);
            expect(c.numero).toBe(1);
        });
    });

    describe("Objetivo", () => {
        it("deve criar instância com campo nivel", () => {
            const o = new Objetivo(1, 1, "Identificar regiões", 1, 2);

            expect(o.id).toBe(1);
            expect(o.nivel).toBe(2);
            expect(o.ordem).toBe(1);
        });

        it("deve aceitar nivel zero (nível básico)", () => {
            const o = new Objetivo(1, 1, "Objetivo básico", 1, 0);

            expect(o.nivel).toBe(0);
        });

        it("deve aceitar nivel 4 (nível máximo)", () => {
            const o = new Objetivo(1, 1, "Objetivo avançado", 1, 4);

            expect(o.nivel).toBe(4);
        });
    });

    describe("Dica", () => {
        it("deve criar instância com penalidade de XP", () => {
            const d = new Dica(1, 1, 1, "Use SELECT *", 10);

            expect(d.penalidadeXp).toBe(10);
            expect(d.conteudo).toBe("Use SELECT *");
        });

        it("deve aceitar penalidade zero", () => {
            const d = new Dica(1, 1, 1, "Dica gratuita", 0);

            expect(d.penalidadeXp).toBe(0);
        });
    });

    describe("Consulta", () => {
        it("deve criar instância com query e colunas", () => {
            const c = new Consulta(1, 1, "SELECT * FROM regioes_reinos;", ["nome_reino", "geografia"], []);

            expect(c.query).toContain("SELECT");
            expect(c.colunas).toHaveLength(2);
            expect(c.resultado).toEqual([]);
        });

        it("deve aceitar resultado preenchido", () => {
            const resultado = [{ nome_reino: "Reino da Luz", geografia: "N" }];
            const c = new Consulta(1, 1, "SELECT * FROM regioes_reinos;", ["nome_reino", "geografia"], resultado);

            expect(c.resultado).toHaveLength(1);
        });
    });

    describe("Visao", () => {
        it("deve criar instância com comando da view", () => {
            const v = new Visao(1, 1, "regioes_reinos");

            expect(v.id).toBe(1);
            expect(v.idCapitulo).toBe(1);
            expect(v.comando).toBe("regioes_reinos");
        });
    });

    describe("Log", () => {
        it("deve criar instância com operação INSERT", () => {
            const l = new Log(1, "Desafio", "INSERT", null, { id: 1 }, "admin", "2026-03-22");

            expect(l.operation).toBe("INSERT");
            expect(l.oldData).toBeNull();
            expect(l.newData).toHaveProperty("id");
        });

        it("deve criar instância com operação UPDATE (old e new data)", () => {
            const l = new Log(2, "Capitulo", "UPDATE", { xp_recompensa: 100 }, { xp_recompensa: 150 }, "admin", "2026-03-22");

            expect(l.operation).toBe("UPDATE");
            expect(l.oldData).toBeDefined();
            expect(l.newData).toBeDefined();
        });

        it("deve criar instância com operação DELETE", () => {
            const l = new Log(3, "Dica", "DELETE", { id: 5 }, null, "admin", "2026-03-22");

            expect(l.operation).toBe("DELETE");
            expect(l.newData).toBeNull();
        });
    });
});
