/**
 * TutorialAwareness.js — Detecta modo tutorial y devuelve config de interfaz
 */

export function getTutorialConfig(tutorialMode) {
  if (tutorialMode) {
    return {
      riskPanel: 'FULL',
      tooltips: 'DETAILED',
      timeline: true,
      historicalCases: true,
      predictions: true,
      guidance: true,
      explanations: true,
      analysisDetail: 'COMPLETE',
    };
  }
  return {
    riskPanel: 'COMPACT',
    tooltips: 'BRIEF',
    timeline: false,
    historicalCases: false,
    predictions: false,
    guidance: false,
    explanations: false,
    analysisDetail: 'DATA_ONLY',
  };
}

export function isTutorialMode() {
  return localStorage.getItem('tutorialMode') === 'true';
}
