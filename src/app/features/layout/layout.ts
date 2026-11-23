import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, BottomNavComponent, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
