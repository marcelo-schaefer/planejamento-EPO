export interface Colaborador {
  NEmpresa: string;
  NTipoColaborador: string;
  NMatricula: string;
  ANome: string;
  NHorasTotais: string;
  NHorasTotaisOriginal: string;
  NHorasApontadas: string;
  NHorasAdicionais: string;
  NDesvio: string;
  AOrigem: string;
  nIdProjetoVinculado?: string;
  incluido?: boolean;
  excluir?: boolean;
}

export class RetornoColaborador {
  outputData: {
    colaboradores: Colaborador[];
    ARetorno?: string;
    message?: string;
  };

  constructor() {
    this.outputData = { colaboradores: [] };
  }
}
