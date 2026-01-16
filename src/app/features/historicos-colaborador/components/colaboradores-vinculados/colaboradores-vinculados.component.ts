import { Colaborador } from './../../services/models/colaborador.model';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  input,
  OnInit,
  Output,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MessageService, Message } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Projeto } from '../../services/models/projeto.model';

@Component({
  selector: 'app-colaboradores-vinculados',
  templateUrl: './colaboradores-vinculados.component.html',
  styleUrls: ['./colaboradores-vinculados.component.css'],
  standalone: true,
  imports: [
    CardModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    InputSwitchModule,
    CalendarModule,
    MessagesModule,
    ToastModule,
    RippleModule,
  ],
})
export class ColaboradoresVinculadosComponent implements OnInit {
  @Output()
  enviarSolicitacao: EventEmitter<boolean> = new EventEmitter<boolean>();

  formApontamento!: FormGroup;
  projetoSelecionado!: Projeto;
  colaboradoresAdicionados!: Colaborador[];
  desabilitar = false;
  horaTotalAlterada!: string;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.limparFormulario();
  }

  enviar(): void {
    if (this.validarEnvio()) this.enviarSolicitacao.emit(true);
  }

  validarEnvio(): boolean {
    return true;
  }

  preencherProjetoSelecionado(projeto: Projeto): void {
    this.projetoSelecionado = projeto;
    this.atualizarColaboradoresNoProjeto();
    this.cdr.detectChanges();
  }

  atualizarColaboradoresNoProjeto(): void {
    this.colaboradoresAdicionados.forEach((colaborador) => {
      colaborador.nIdProjetoVinculado = this.projetoSelecionado.NId;
    });

    this.projetoSelecionado.colaboradores.forEach((colaborador) => {
      colaborador.NHorasTotaisOriginal = colaborador.NHorasTotais;
    });
  }

  limparFormulario(): void {
    this.projetoSelecionado = null;
    this.colaboradoresAdicionados = [];
  }

  adicionarColaborador(colaborador: Colaborador): void {
    const colaboradorNaoPlanejado = this.projetoSelecionado.colaboradores.find(
      (f) => f.NMatricula == colaborador.NMatricula
    );

    if (colaboradorNaoPlanejado) {
      colaborador.NHorasApontadas = colaboradorNaoPlanejado.NHorasApontadas;
      colaborador.NHorasTotaisOriginal = '00:00';
      colaborador.NDesvio = this.calculaDesvio(colaborador);
    }

    colaborador.AOrigem = 'Planejado';
    this.colaboradoresAdicionados.push(colaborador);
  }

  calculaDesvio(colaborador: Colaborador): string {
    const horasTotais = colaborador?.NHorasTotais
      ? this.converterParaMinutos(colaborador?.NHorasTotais)
      : 0;
    const horasApontadas = this.converterParaMinutos(
      colaborador?.NHorasApontadas
    );

    if (horasTotais < horasApontadas)
      colaborador.NDesvio =
        '- ' + this.converterParaHoraFormatada(horasApontadas - horasTotais);
    else
      colaborador.NDesvio = this.converterParaHoraFormatada(
        horasTotais - horasApontadas
      );
    return colaborador.NDesvio;
  }

  retornaListaColaboradoresTabela(): Colaborador[] {
    return (
      (this.projetoSelecionado && this.projetoSelecionado.colaboradores
        ? this.projetoSelecionado.colaboradores
            .filter(
              (f) =>
                !this.colaboradoresAdicionados.some(
                  (colabAdicionado) =>
                    colabAdicionado.NMatricula == f.NMatricula
                )
            )
            .concat(this.colaboradoresAdicionados)
        : this.colaboradoresAdicionados) || []
    );
  }

  retornaListaColaboradoresGravacao(): Colaborador[] {
    return (
      (this.projetoSelecionado && this.projetoSelecionado.colaboradores
        ? this.projetoSelecionado.colaboradores
            .filter(
              (f) =>
                (!f.excluir && f.NHorasTotais != f.NHorasTotaisOriginal) ||
                (f.excluir &&
                  !this.colaboradoresAdicionados.some(
                    (colabAdicionado) =>
                      colabAdicionado.NMatricula == f.NMatricula
                  ))
            )
            .map((m) => {
              return {
                ...m,
                nIdProjetoVinculado: this.projetoSelecionado.NId,
              } as Colaborador;
            })
            .concat(this.colaboradoresAdicionados)
        : this.colaboradoresAdicionados) || []
    );
  }

  botaoExcluir(colaborador: Colaborador): void {
    this.colaboradoresAdicionados.splice(
      this.colaboradoresAdicionados.indexOf(
        this.colaboradoresAdicionados.find(
          (f) =>
            f?.NEmpresa == colaborador?.NEmpresa &&
            f?.NMatricula == colaborador?.NMatricula
        )
      ),
      1
    );
  }

  desabilitarFormulario(desabilitar: boolean): void {
    this.desabilitar = desabilitar;
  }

  converterParaMinutos(tempo: string): number {
    if (tempo) {
      if (tempo.includes('-')) {
        tempo = tempo.split('-')[1];
        const [horas, minutos] = tempo.split(':').map(Number);
        return -(horas * 60 + minutos);
      } else {
        const [horas, minutos] = tempo.split(':').map(Number);
        return horas * 60 + minutos;
      }
    }
    return 0;
  }

  converterParaHoraFormatada(minutosTotais: number): string {
    if (minutosTotais) {
      const horas = Math.abs(Math.floor(minutosTotais / 60));
      const minutos = Math.abs(minutosTotais % 60);

      const horasFormatadas = horas.toString().padStart(2, '0');
      const minutosFormatados = minutos.toString().padStart(2, '0');

      if (minutosTotais < 0) return `- ${horasFormatadas}:${minutosFormatados}`;
      return `${horasFormatadas}:${minutosFormatados}`;
    }
    return '00:00';
  }

  verificaDesvioNegativo(desvio: string): boolean {
    return desvio.includes('-');
  }

  calculaHorasPlanejadasTotais(): string {
    return this.converterParaHoraFormatada(
      this.retornaListaColaboradoresTabela().reduce(
        (sum, colaborador) =>
          sum +
          (Number(
            colaborador.NHorasTotais.indexOf(':') > 0
              ? this.converterParaMinutos(colaborador.NHorasTotais)
              : Number(colaborador.NHorasTotais) * 60
          ) ?? 0),
        0
      ) || 0
    );
  }

  calculaHorasApontadasTotais(): string {
    return this.converterParaHoraFormatada(
      this.retornaListaColaboradoresTabela().reduce(
        (sum, colaborador) =>
          sum + (this.converterParaMinutos(colaborador.NHorasApontadas) || 0),
        0
      ) || 0
    );
  }

  calculaDesvioTotal(): string {
    return this.converterParaHoraFormatada(
      this.retornaListaColaboradoresTabela().reduce(
        (sum, colaborador) =>
          sum + (this.converterParaMinutos(colaborador.NDesvio) || 0),
        0
      ) || 0
    );
  }

  verificaSeHorasTotaisMenorHorasApontadas(
    horasTotalNovas: string,
    horasTotalAntiga: string,
    horasApontadas: string
  ): boolean {
    const minutosNovos = this.converterParaMinutos(horasTotalNovas);
    const minutosAntigos = this.converterParaMinutos(horasTotalAntiga);
    const minutosApontados = this.converterParaMinutos(horasApontadas);
    return minutosNovos > minutosApontados || minutosNovos >= minutosAntigos;
  }

  formatarHorasTotaisAlteradas(index: number): void {
    if (
      this.verificaSeHorasTotaisMenorHorasApontadas(
        this.horaTotalAlterada,
        this.retornaListaColaboradoresTabela()[index].NHorasTotaisOriginal,
        this.retornaListaColaboradoresTabela()[index].NHorasApontadas
      )
    ) {
      this.retornaListaColaboradoresTabela()[index].NHorasTotais =
        this.horaTotalAlterada;
    }
  }

  formatacaoNovaHorasTotais(horasTotais: string): string {
    if (horasTotais.includes(':')) {
      const partes = horasTotais.split(':');

      const horas = Number(partes[0].replace(/\D/g, '')) || 0;

      let minutosStr = (partes[1] || '').replace(/\D/g, '');

      if (partes[1] === undefined) return `${horas}:`;

      let minutos = Number(minutosStr);

      if (isNaN(minutos)) return `${horas}:`;

      if (minutos > 59) minutos = 59;

      const horasFormatadas = `${horas}:${String(minutos).padStart(2, '0')}`;
      this.horaTotalAlterada = horasFormatadas;
      return horasFormatadas;
    }

    const numeros = horasTotais.replace(/\D/g, '');

    if (!numeros) return '';

    if (numeros.length <= 2) return numeros;

    const horas = Number(numeros.slice(0, -2));
    let minutos = Number(numeros.slice(-2));

    if (minutos > 59) minutos = 59;

    const horasFormatadas = `${horas}:${String(minutos).padStart(2, '0')}`;
    this.horaTotalAlterada = horasFormatadas;
    return horasFormatadas;
  }
}
