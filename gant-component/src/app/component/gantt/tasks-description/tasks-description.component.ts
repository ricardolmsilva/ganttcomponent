import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {IProject, IProjects} from '../gantt.component.interface';
import {Observable, Subscription} from 'rxjs';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tasks-description',
  templateUrl: './tasks-description.component.html',
  styleUrls: ['./tasks-description.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksDescriptionComponent implements OnInit, OnChanges, OnDestroy {

  @Input() projectsObservable: Observable<IProjects>;
  private _subscription: Subscription;
  public projects: IProjects;
  private _projectsKeys: Array<string>;
  public projectsKeysDatasource: Array<string>;

  @Input() scrollPosition: number;
  @Output() scrollPositionChange: EventEmitter<number>;

  private _scrollViewPort: HTMLElement;
  private _scrollHistory: number;
  private _excessHeight: number;
  public freeSpaceTop: number;
  private _indexMax: number; // histórico do index dos items adicionados quando o scroll aumenta
  private _indexMin: number; // histórico do index dos items adicionados quando o scroll diminui

  constructor() {
    this.scrollPositionChange = new EventEmitter<number>();
  }

  ngOnInit() {

    this._subscription = this.projectsObservable.subscribe((value: IProjects) => {
      this.projects = value;
    });

    this._projectsKeys = [];

    for (const projKey of Object.keys(this.projects)) {
      this._projectsKeys.push(projKey);
    }

    this._scrollHistory = 0;
    this.freeSpaceTop = 0;
    this._initVirtualScroll();
  }

  ngOnChanges({scrollPosition}: SimpleChanges): void {
    if (scrollPosition && !scrollPosition.isFirstChange()) {
      this.scrollPosition = scrollPosition.currentValue;
      document.querySelector('.scroll-viewport').scroll(0, scrollPosition.currentValue);
    }
  }


  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    this._dettachScrollEvent();
  }

  public toggleCollapseProject(projectClicked: IProject): void {
    projectClicked.collapsed = !projectClicked.collapsed;
  }

  public drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.projectsKeysDatasource, event.previousIndex, event.currentIndex);
  }

  public dropInside(event: CdkDragDrop<string[]>) {
    let arrayAux: Array<any>;
    arrayAux = [];

    for (const itemKey of Object.keys(event.container.data)) {
      arrayAux.push(event.container.data[itemKey]);
      delete event.container.data[itemKey];
    }

    const objAux: any = arrayAux[event.previousIndex];

    arrayAux.splice(event.previousIndex, 1);
    arrayAux.splice(event.currentIndex, 0, objAux);

    Object.assign(event.container.data, arrayAux);
  }

  @ViewChild('scrollViewPort')
  public set scrollViewPort(value: ElementRef<HTMLElement>) {
    this._scrollViewPort = value ? value.nativeElement : undefined;
    this._attachScrollEvent();
  }

  public fnScrollEventHandler = (event: Event) => this._scrollEventHandler(event);

  private _attachScrollEvent(): void {
    if (this._scrollViewPort) {
      this._scrollViewPort.addEventListener<'scroll'>('scroll', this.fnScrollEventHandler, {passive: true});
    }
  }

  private _dettachScrollEvent(): void {
    if (this._scrollViewPort) {
      this._scrollViewPort.removeEventListener<'scroll'>('scroll', this.fnScrollEventHandler);
    }
  }

  private _scrollEventHandler(event: Event): void {
    const myScrollTop: number = (event.target as HTMLElement).scrollTop;
    const myScrollHeight: number = (event.target as HTMLElement).scrollHeight;
    const myScrollViewPortHeight: number = this._scrollViewPort.clientHeight;

    this.scrollPositionChange.emit(myScrollTop);

    // verificar se o scroll esta a subir ou a descer
    if (this._scrollHistory < myScrollTop) {
      this._scrollHistory = myScrollTop;

      if (
        myScrollTop > this._excessHeight + this.projects[this.projectsKeysDatasource[0]]._projectItems * 32 &&
        (myScrollHeight - myScrollTop - myScrollViewPortHeight) <
          this._excessHeight +
          this.projects[this.projectsKeysDatasource[this.projectsKeysDatasource.length - 1]]._projectItems * 32 &&
        this.projectsKeysDatasource[this.projectsKeysDatasource.length - 1] !== this._projectsKeys[this._projectsKeys.length - 1]
      ) {
        this._indexMax++;
        this._indexMin++;
        this.projectsKeysDatasource.push(this._projectsKeys[this._indexMax]);
        this.freeSpaceTop += this.projects[this.projectsKeysDatasource[0]]._projectItems * 32;
        this.projectsKeysDatasource.shift();
      }

    } else {
      this._scrollHistory = myScrollTop;

      if (
        myScrollTop > this.projects[this.projectsKeysDatasource[0]]._projectItems * 32 &&
        (myScrollHeight - myScrollTop - myScrollViewPortHeight) > this.projects[this.projectsKeysDatasource[this.projectsKeysDatasource.length - 1]]._projectItems * 32 &&
        this.projectsKeysDatasource[0] !== this._projectsKeys[0]
      ) {
        this._indexMax--;
        this._indexMin--;
        this.projectsKeysDatasource.unshift(this._projectsKeys[this._indexMin]);
        this.freeSpaceTop -= this.projects[this.projectsKeysDatasource[0]]._projectItems * 32;
        this.projectsKeysDatasource.pop();
      }

    }
  }

  private _initVirtualScroll() {

    const myScrollViewPortHeight: number = document.querySelector('.scroll-viewport').clientHeight;

    let myRenderedHeight = 0;

    this.projectsKeysDatasource = [];

    let i: number;
    for (i = 0; myRenderedHeight < myScrollViewPortHeight; i++) {
      this.projectsKeysDatasource.push(this._projectsKeys[i]);

      myRenderedHeight += this.projects[this._projectsKeys[i]]._projectItems * 32;
      // _projectItems tem o nº total de items por project; 32 é o nº de px por row
    }

    this.projectsKeysDatasource.push(this._projectsKeys[i]);
    i++;
    this.projectsKeysDatasource.push(this._projectsKeys[i]);

    this._indexMin = 0;
    this._indexMax = this.projectsKeysDatasource.length - 1;
    this._excessHeight = myRenderedHeight - myScrollViewPortHeight;

    document.querySelector('.scroll-viewport').scroll(0, 0);
  }
}
