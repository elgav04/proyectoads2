export const PERMISOS_MENU: Record<string, string[]> = {
    Administrador: ["/areas", "/turnos", "/empleados", "/registros", "/usuarios_sistema"],
    Supervisor:    ["/registros", "/usuarios_sistema"],
    RRHH:          ["/areas", "/turnos", "/empleados", "/registros", "/usuarios_sistema"],
  };