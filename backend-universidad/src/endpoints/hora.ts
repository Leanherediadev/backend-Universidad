export interface RespuestaHora {
  fecha: string;
  zonaHoraria: string;
}

export function obtenerHora(): RespuestaHora {
  return {
    fecha: new Date().toISOString(),
    zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
