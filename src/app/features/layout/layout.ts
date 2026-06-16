import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

}
