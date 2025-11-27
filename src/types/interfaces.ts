  export interface Area {
    Id: number;
    Nombre: string;
    Estado: string;
  }

  export interface Turno {
    Id: number;
    Nombre: string;
    HoraEntrada: string;
    HoraSalida: string;
    Estado: string;
  }

  export interface Empleado {
    Id: number;
    EnrollNumber: string;
    Nombres: string;
    Apellidos: string;
    Documento: string;
    Direccion: string;
    Telefono: string;
    Fechaingreso: string;
    Id_Area: number;
    Id_Turno: number;
    Cargo: string;
    Sueldo: number;
    Estado: string;
    EstadoBiometrico: string;
  }

  export interface Registro {
    Id: number;
    EnrollNumber: string;
    VerifyMode: number;
    InOutMode: number;
    FechaHora: string;
    Year: number;
    Month: number;
    Day: number;
    Hour: number;
    Minute: number;
    Second: number;
    WorkCode: number;
  }

  export interface Usuario {
    Id: number;
    Usuario: string;
    Clave: string;
    Rol: string;
    Id_Empleado?: number | null;
    Estado: string;
  }