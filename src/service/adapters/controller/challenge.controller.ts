// ChallengeController refatorado para refletir o novo DDL (Desafio/Capitulo e relations)

import { Request, Response } from "express";
import { DesafioUseCase } from "../../core/useCases/desafio.useCase";
import { DesafioPostgresRepository } from "../repository/postgres/gestao/desafio.postgres.repository";
import { CapituloUseCase } from "../../core/useCases/capitulo.useCase";
import { CapituloPostgresRepository } from "../repository/postgres/gestao/capitulo.postgres.repository";
import { ObjetivoUseCase } from "../../core/useCases/objetivo.useCase";
import { ObjetivoPostgresRepository } from "../repository/postgres/gestao/objetivo.postgres.repository";
import { DicaUseCase } from "../../core/useCases/dica.useCase";
import { DicaPostgresRepository } from "../repository/postgres/gestao/dica.postgres.repository";
import { ConsultaUseCase } from "../../core/useCases/consulta.useCase";
import { ConsultaPostgresRepository } from "../repository/postgres/gestao/conuslta.postgres.repository";
import { Desafio } from "../../core/domain/desafio.entity";
import { ApiResponse } from "../../core/domain/http.entity";
import { Capitulo } from "../../core/domain/capitulo.entity";
import { Objetivo } from "../../core/domain/objetivo.entity";
import { Dica } from "../../core/domain/dica.entity";
import { Consulta } from "../../core/domain/consulta.entity";

const desafioUseCase = new DesafioUseCase(new DesafioPostgresRepository());
const capituloUseCase = new CapituloUseCase(new CapituloPostgresRepository());
const objetivoUseCase = new ObjetivoUseCase(new ObjetivoPostgresRepository()); // Repositório de capítulo tem métodos para pegar por capítuloId
const dicaUseCase = new DicaUseCase(new DicaPostgresRepository()); // Repositório de capítulo tem métodos para pegar por capítuloId
const consultaUseCase = new ConsultaUseCase(new ConsultaPostgresRepository()); // Repositório de capítulo tem métodos para pegar por capítuloId

class ChallengeController {
    /**
     * GET /challenges
     * Lista todos os desafios, incluindo (opcionalmente) capítulos relacionados.
     */
    async getAll(req: Request, res: Response<ApiResponse<Desafio[]>>) {
        try {
            // Buscar todos os desafios
            const desafios = await desafioUseCase.getAll();

            // Se quiser incluir capítulos embutidos:
            // TODO[refactor]: Avaliar performance e necessidade de incluir capítulos aqui, ou deixar para endpoint específico.
            // const desafiosWithCapitulos = await Promise.all(
            //     desafios.map(async (desafio) => {
            //         const capitulos = await capituloUseCase.getById(desafio.id);
            //         // Aqui o shape retornado é mais "desafio com capítulos", não o "MysteryDetail" completo, mas pode ser útil para listagem.
            //         return { ...desafio, capitulos };
            //     })
            // );

            res.status(200).json({ data: desafios });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * GET /challenges/:id
     * Retorna um desafio por ID, incluindo seus capítulos (capitulos), objetivos (objetivos),
     * dicas (dicas) e solução esperada (expectedOutput) por capítulo.
     */
    async getById(req: Request, res: Response<ApiResponse<Desafio>>) {
        try {
            const id = Number(req.params.id);
            // [TODO]: change this hardcoded cap_id when we have the real relation in DB, for now we can assume all desafios have same cap_id for testing
            const cap_id = 1;
            const desafio = await desafioUseCase.getById(id);

            if (!desafio) {
                return res.status(404).json({ message: "Desafio não encontrado." });
            }

            // Pega todos os capítulos do desafio
            // [TODO]: 
            // const capitulos = await capituloUseCase.getByDesafioId(desafio.id);

            // // Para cada capítulo, inclui objetivos, dicas e expectedOutput
            // const capitulosDetalhados = await Promise.all(capitulos.map(async (cap) => {
            //     const objetivos = await objetivoUseCase.getByCapituloId(cap.id);
            //     const dicas = await dicaUseCase.getByCapituloId(cap.id);
            //     const consulta = await consultaUseCase.getByCapituloId(cap.id); // Espera um array ou null

            //     return {
            //         ...cap,
            //         objetivos,
            //         dicas,
            //         expectedOutput: consulta?.[0] || null // se table retorna lista, pega primeiro
            //     };
            // }));
            // O shape retornado é o verdadeiro "MysteryDetail"
            res.status(200).json({
                data: desafio,
                // ...cap,
                // objetivos,
                // dicas,
                // expectedOutput: consulta?.[0] || null // se table retorna lista, pega primeiro
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * POST /challenges/get-with-capitulo/
     * Req<>body: { desafioId: number, capituloId: number }
     * Retorna um desafio junto ao respectivo capítulo, objetivos, dicas e solução esperada para um capítulo específico.
     * [TODO]: definir melhor o shape de resposta, se é um "MysteryDetail" completo ou um shape customizado para essa rota.
     */
    async getWithCapitulo(req: Request, res: Response<ApiResponse<{ desafio: Desafio & Capitulo; objetivos: Objetivo[]; dicas: Dica[]; consultaSolucao: Consulta[]; }>>) {
        try {
            // const categoryId = Number(req.params.categoryId);
            const desafioId: string | null = req.body.desafioId || null;
            const capituloId = 1; // Placeholder, ajustar quando tiver a rota definida

            if (!desafioId) {
                return res.status(400).json({ message: "Desafio ID é obrigatório." });
            }

            // [TODO]: implementar método no useCase para buscar por capítulo, e ajustar repositório para suportar isso.
            const desafio = await desafioUseCase.getWithCapitulo(Number(desafioId), capituloId);

            if (!desafio) {
                return res.status(404).json({ message: "Desafio não encontrado para o capítulo." });
            }

            // Similar ao getById, mas filtrando por capítulo. O shape retornado pode ser o mesmo "MysteryDetail" ou um customizado.
            res.status(200).json({
                data: {
                    desafio,
                    objetivos: await objetivoUseCase.getByCapituloId(capituloId), // TODO: ajustar para pegar por desafioId e capituloId
                    dicas: await dicaUseCase.getByCapituloId(capituloId), // TODO: ajustar para pegar por desafioId e capituloId
                    consultaSolucao: await consultaUseCase.getByCapituloId(capituloId) // TODO: ajustar para pegar por desafioId e capituloId, e talvez retornar lista    
                }
            }); // Placeholder
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ChallengeController();