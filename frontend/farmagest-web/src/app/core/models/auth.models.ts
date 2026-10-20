export interface LoginRequest {
  username: string;
  password: string;
}

export interface UsuarioInfo {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  rolPrincipal: string;
  sucursalId: number;
  roles: string[];
  permisos: string[];
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiracionMs: number;
  usuario: UsuarioInfo;
}

export interface UsuarioDetalle {
  id: number;
  username: string;
  nombres: string;
  apellidos: string;
  email: string;
  sucursalId: number;
  activo: boolean;
  creadoEn: string;
  roles: string[];
  permisos: string[];
}

export interface CrearUsuarioForm {
  username: string;
  password: string;
  nombres: string;
  apellidos: string;
  email: string;
  sucursalId: number;
  rolIds: number[];
}
