import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const reportesRoleGuard:CanActivateFn=(route)=>{
 const auth=inject(AuthService);return auth.hasAnyRole(route.data['roles']||[])?true:inject(Router).createUrlTree(['/dashboard']);
};
