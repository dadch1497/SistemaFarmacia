import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-landing-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-home.component.html',
  styleUrls: ['./landing-home.component.css']
})
export class LandingHomeComponent {
  constructor(private router: Router) {}

  irALogin(): void {
    this.router.navigate(['/login']);
  }
}
