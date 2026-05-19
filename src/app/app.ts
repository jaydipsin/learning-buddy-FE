import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { appStore } from './core/store/app.store';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [appStore],
})
export class App implements OnInit {
  protected readonly title = signal('learning-buddy');
  private readonly appStore = inject(appStore);

  ngOnInit() {

  }
}
