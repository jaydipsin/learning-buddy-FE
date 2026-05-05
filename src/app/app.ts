import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {  appStore } from './store/app.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [appStore],
})
export class App {
  protected readonly title = signal('learning-buddy');
  private readonly appStore = inject(appStore);
  constructor() {
     this.appStore.loadUserData();
  }
}
