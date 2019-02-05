import { Component, ViewChild } from '@angular/core';
import { throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OpenviduSessionComponent, StreamEvent, Session, UserModel, OpenViduLayout, OpenViduLayoutOptions } from 'openvidu-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  OPENVIDU_SERVER_URL = 'https://' + location.hostname + ':4443';
  OPENVIDU_SERVER_SECRET = 'MY_SECRET';

  // Join form
  mySessionId = '';
  myUserName = '' + Math.floor(Math.random() * 100);
  token: string;
  session = false;

  ovSession: Session;
  ovLocalUser: UserModel;
  ovLayout: OpenViduLayout;
  ovLayoutOptions: OpenViduLayoutOptions;

  @ViewChild('ovSessionComponent')
  public ovSessionComponent: OpenviduSessionComponent;

  constructor(private httpClient: HttpClient) { }

}


  