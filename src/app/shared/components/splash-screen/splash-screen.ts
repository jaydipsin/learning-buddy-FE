import { Component, output } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.html',
  styleUrl: './splash-screen.css',
})
export class SplashScreenComponent {
  readonly artworkReady = output<void>();
}
