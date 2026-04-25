export function getUIMode(tutorialMode) {
  if (tutorialMode) {
    return {
      barrasControl: 'SLIDER_FULL',
      bombaOnOff: 'BUTTON_SIMPLE',
      bombaVelocidad: 'HIDDEN',
      valvulaAlivio: 'DISPLAY_ONLY',
      enfriamientoAux: 'DISPLAY_ONLY',
      bombaRespaldo: 'DISPLAY_ONLY',
      messages: 'DETAILED_EDUCATIONAL',
      tooltips: 'COMPLETE_EXPLANATIONS',
    };
  }
  return {
    barrasControl: 'SLIDER_FULL',
    bombaOnOff: 'HIDDEN',
    bombaVelocidad: 'SLIDER_FULL',
    valvulaAlivio: 'SLIDER_FULL',
    enfriamientoAux: 'SLIDER_FULL',
    bombaRespaldo: 'BUTTON_ADVANCED',
    messages: 'TECHNICAL_BRIEF',
    tooltips: 'MINIMAL_NECESSARY',
  };
}
