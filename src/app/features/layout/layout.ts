import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header";
import { RouterModule } from "@angular/router";
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterModule, IonContent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
