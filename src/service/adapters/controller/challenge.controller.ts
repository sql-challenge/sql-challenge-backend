// import { MysteryDetail } from '../../core/domain/challenge.entity';
// import { IChallengePort } from '../../core/ports/challenge.port';
import { ChallengeUseCase } from '../../core/useCases/challenge.useCase';
// import { getMysteryById, mockMysteries } from '../../mock/challenge.mock';
import { ChallengePostgresRepository } from '../repository/postgres/gestao/challenge.postgres.repository';

// const mockService: IChallengePort = {
//     getAll: async () => {
//         return mockMysteries;
//     },
//     getById: async (id: string): Promise<MysteryDetail | null> => {
//         const mystery = getMysteryById(id);
//         //
//         return mystery;
//     }
// }

const challengeRepository = new ChallengePostgresRepository()

class ChallengeController {
    private challengeUseCase: ChallengeUseCase;
    constructor() {
        this.challengeUseCase = new ChallengeUseCase(challengeRepository);
    }

    async getAll(req: any, res: any) {
        try {
            const challenges = await this.challengeUseCase.getAll();
            res.status(200).json(challenges);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async getById(req: any, res: any) {
        try {
            const id = req.params.id;
            const challenge = await this.challengeUseCase.getById(id);
            if (challenge) {
                res.status(200).json(challenge);
            } else {
                res.status(404).json({ message: "Desafio não encontrado." });
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new ChallengeController();