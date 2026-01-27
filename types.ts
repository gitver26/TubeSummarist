
export interface HowToStep {
  step: string;
  description: string;
}

export interface VideoInsight {
  summary: string;
  isHowTo: boolean;
  howToSteps?: HowToStep[];
  title: string;
  sourceUrls?: string[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
