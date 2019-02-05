import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
import { AppComponent } from './app.component';

import { OpenViduModule } from 'angular-openvidu';
import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    OpenViduModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
