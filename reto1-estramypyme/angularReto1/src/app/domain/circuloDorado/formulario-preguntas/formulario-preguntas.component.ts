import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { PreguntasService } from '../services/preguntas.service';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulario-preguntas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './formulario-preguntas.component.html',
  styleUrl: './formulario-preguntas.component.css',
})
export class FormularioPreguntasComponent implements OnInit, AfterViewInit {
  //Propiedades de la clase o variables que se declaran dentro de una clase)
  preguntas: any[] = [];
  indexPregunta: number = 0;
  valorProgreso: number = 0;
  objetoPregunta: any;
  opciones: any;
  seleccionada: boolean = true;
  isPorQueChecked: boolean = true;
  isComoChecked: boolean = false;
  isQueChecked: boolean = false;
  isActive: boolean = true;
  nadaporque: number = 0;
  pocoPorque: number = 0;
  muchoPorue: number = 0;
  contenedorGrafica: any;

  //Comunica cambios en el estado del componente a otros componentes
  @Output() cambioPregunta = new EventEmitter<number>();

  /*"Inyecta el servicio PreguntasService en la clase y crea una propiedad privada preguntaService
  para acceder a sus métodos y propiedades."*/
  constructor(private preguntaService: PreguntasService) {}

  //Cuando el componente se inicializa
  ngOnInit(): void {
    this.preguntas = this.preguntaService.getPreguntas();
    this.cargarPregunta(this.indexPregunta);
  }

  @ViewChild('graficaProgreso') contenedor!: ElementRef;

  ngAfterViewInit(): void {
    this.contenedorGrafica = echarts.init(this.contenedor.nativeElement);
    this.actualizarProgreso(this.indexPregunta);
  }

  actualizarProgreso(value: number) {
    this.valorProgreso = this.indexPregunta * 7;

    if (this.valorProgreso > 100) {
      this.valorProgreso = 100;
    }
    const opciones = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '50%'],
          radius: '100%',
          pointer: {
            show: true,
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              borderWidth: 1,
              borderColor: '#464646',
            },
          },
          axisLine: {
            lineStyle: {
              width: 30,
            },
          },
          splitLine: {
            show: true,
            length: 30,
            lineStyle: {
              color: 'auto',
              width: 2,
            },
          },
          axisTick: {
            show: true,
            splitNumber: 1, // Número de pequeños ticks entre los principales
            length: 15,
            lineStyle: {
              color: 'auto',
              width: 2,
            },
          },
          axisLabel: {
            show: true,
            distance: 30,
            fontSize: 15,
            formatter: function (value: number) {
              if (value % (100 / 15) === 0) {
                return value;
              } else {
                return '';
              }
            },
          },
          data: [
            {
              value: this.valorProgreso,
              name: 'Progreso',
              title: {
                offsetCenter: ['0%', '-30%'],
              },
              detail: {
                offsetCenter: ['0%', '45%'],
              },
            },
          ],
          title: {
            fontSize: 14,
          },
          detail: {
            width: 50,
            height: 14,
            fontSize: 20,
            color: 'auto',
            formatter: '{value}%',
          },
        },
      ],
    };

    if (this.contenedorGrafica) {
      this.contenedorGrafica.setOption(opciones);
    }
  }

  //Cargar cada pregunta del servicio
  cargarPregunta(index: number) {
    if (index < this.preguntas.length) {
      this.seleccionada = false;
      this.objetoPregunta = this.preguntas[index];
      this.opciones = this.objetoPregunta.opciones;
      console.log(`Cargando pregunta con índice: ${index}`);
    } else {
      console.log('No hay más preguntas.');
    }
  }

  //Método para validar que alguna opción sea seleccionada y así avanzar a la siguiente pregunta
  manejarSiguiente() {
    if (!this.seleccionada) {
      Swal.fire({
        icon: 'error',
        title: 'Selecciona una opción 😒',
      });
      return;
    }

    // Incrementa el índice de la pregunta para avanzar a la siguiente.
    this.indexPregunta++;

    //emite un evento cambioPregunta con el valor actual de this.indexPregunta como parámetro.
    this.cambioPregunta.emit(this.indexPregunta);

    if (this.indexPregunta == 15) {
      Swal.fire({
        title: "¡Bien hecho, has finalizado todas las secciones' 👏",
        text: '¡Modelo Círculo Dorado completado!🎉',
        // customClass: 'my-custom-class',
      });
      this.indexPregunta = 0;
      this.cargarPregunta(this.indexPregunta);
    }

    if (this.indexPregunta == 5) {
      Swal.fire({
        title: "¡Bien hecho, has terminado la sección '¿Por qué?'! 👏",
        // customClass: 'my-custom-class',
      }).then(() => {
        this.isComoChecked = true;
        this.cargarPregunta(this.indexPregunta);
      });
    } else if (this.indexPregunta == 10) {
      Swal.fire({
        title: "¡Bien hecho, has terminado la sección '¿Cómo?!' 👏",
        // customClass: 'my-custom-class',
      }).then(() => {
        this.isQueChecked = true;
        this.cargarPregunta(this.indexPregunta);
      });
    }
    this.cargarPregunta(this.indexPregunta); // Carga la nueva pregunta.
    this.actualizarProgreso(this.indexPregunta); // Actualiza el progreso.
  }

  manejarAnterior() {
    if (this.indexPregunta > 0) {
      this.indexPregunta--; // Disminuye el índice de la pregunta para retroceder a la anterior.
    }

    this.cargarPregunta(this.indexPregunta); // Carga la nueva pregunta.
    this.actualizarProgreso(this.indexPregunta); // Actualiza el progreso.
  }
}
