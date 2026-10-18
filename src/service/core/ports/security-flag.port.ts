import { SecurityFlag } from "../domain/security-flag.entity";

/**
 * Escrita de flags NUNCA pode quebrar o fluxo de jogo — as
 * implementações devem engolir/logar os próprios erros.
 */
export interface ISecurityFlagPort {
	insertMany(flags: SecurityFlag[]): Promise<void>;
	listByDesafio(desafioId?: string): Promise<(SecurityFlag & { id: string })[]>;
}
