export enum EScaleStates {
  hours
}

export interface IInputOptions {
  range: IDate;
  viewScale: number;
  editScale: number;
}

export interface IProjects {
  [id: string]: IProject;
}

export interface IProject {
  name: string;
  color: string;
  date: IDate;
  tasks?: ITasks;
  _hasTasks?: boolean;
  projectChildren?: IProjects;
  _hasChildren?: boolean;
  genealogyDegree: number;
  collapsed: boolean;
  _descriptionStyle?: IStyle;
  _detailsStyle?: IStyle;
  _projectItems?: number;
}

export interface ITasks {
  [id: string]: ITask;
}

export interface ITask {
  name: string;
  color: string;
  date: IDate;
  progress?: number;
  dependencies?: IDependencies;
  genealogyDegree: number;
  collapsed: boolean;
  _descriptionStyle?: IStyle;
  _detailsStyle?: IStyle;
}

export interface IDate {
  from: Date;
  to: Date;
}

export interface IDependencies {
  from?: ITasks;
  to?: ITasks;
}

interface IStyle {
  [property: string]: string;
}
