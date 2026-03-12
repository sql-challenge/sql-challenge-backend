// src/core/domain/capitulo.entity.ts

import { Consulta } from "./consulta.entity";
import { Dica } from "./dica.entity";
import { Objetivo } from "./objetivo.entity";

// --- CapituloView & DatabaseSchema types ---
export class Desafio {
    constructor(
        public id: number,
        public titulo: string,
        public descricao: string,
        // public xpRecompensa: number,
        public tempoEstimado: string,
        public taxaConclusao: number,
        public criadoEm: string,
        public atualizadoEm: string
    ) {}
}

export interface Capitulo {
  id: number;
  idDesafio: number;
  introHistoria: string;
  xp_recompensa: number;
  contextoHistoria: string;
  numero: number;
}

// export interface Objetivo {
//   id: number;
//   idCapitulo: number;
//   descricao: string;
//   ordem: number;
// }

// export interface Dica {
//   id: number;
//   idCapitulo: number;
//   ordem: number;
//   conteudo: string;
//   penalidadeXp: number;
// }

// export interface Consulta {
//   id: number;
//   idCapitulo: number;
//   colunas: string[];
//   resultado: Record<string, unknown>[];
// }

export interface DatabaseSchema {
  visaoTabelas: VisaoTabela[];
  visaoRelacionamentos: VisaoRelacionamento[];
}

export interface VisaoTabela {
  id: number;
  id_visao: number;
  nome: string;
  descricao: string | null;
  colunas: VisaoColuna[];
  exemplos: VisaoDadoExemplo[];
}

export interface VisaoColuna {
  id: number;
  id_tabela: number;
  nome: string;
  tipo: string;
  nulavel: boolean;
  chave_primaria: boolean;
  fk_tabela?: string | null;
  fk_coluna?: string | null;
  descricao: string | null;
}

export interface VisaoRelacionamento {
  id: number;
  id_visao: number;
  tabela_origem: string;
  tabela_destino: string;
  tipo: "one-to-one" | "one-to-many" | "many-to-many";
  coluna_origem: string;
  coluna_destino: string;
}

export interface VisaoDadoExemplo {
  id: number;
  id_tabela: number;
  dados: Record<string, unknown>;
}

// Example CapituloView using the new DDL-matching names
export interface CapituloView {
  capitulo: Capitulo;
  objetivos: Objetivo[];
  dicas: Dica[];
  consultaSolucao: Consulta;
  schema: DatabaseSchema;
}
