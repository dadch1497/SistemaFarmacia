import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingDataService, ArticuloBlog } from '../../landing-data.service';

@Component({
  selector: 'app-landing-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-blog.component.html',
  styleUrls: ['./landing-blog.component.css']
})
export class LandingBlogComponent {
  constructor(public landingData: LandingDataService) {}

  get articulos(): ArticuloBlog[] {
    return this.landingData.articulos;
  }

  abrirArticulo(art: ArticuloBlog): void {
    this.landingData.abrirArticulo(art);
  }
}
