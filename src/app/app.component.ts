import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { OpenVidu, Publisher, Session, StreamEvent, StreamManager, Subscriber } from 'openvidu-browser';
import { throwError as observableThrowError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

  OPENVIDU_SERVER_URL = 'https://' + location.hostname + ':4443';
  OPENVIDU_SERVER_SECRET = 'MY_SECRET';

  // OpenVidu objects
  OV: OpenVidu;
  session: Session;
  publisher: StreamManager; // Local
  subscribers: StreamManager[] = []; // Remotes

  // Join form
  mySessionId: string;
  myUserName: string;


  mainStreamManager: StreamManager;

  constructor(private httpClient: HttpClient) {
    this.generateParticipantInfo();
  }

  @HostListener('window:beforeunload')
  beforeunloadHandler() {

    this.leaveSession();
  }

  ngOnDestroy() {

    this.leaveSession();
  }

  joinSession() {



    this.OV = new OpenVidu();



    this.session = this.OV.initSession();




    this.session.on('streamCreated', (event: StreamEvent) => {


      let subscriber: Subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);
    });


    this.session.on('streamDestroyed', (event: StreamEvent) => {

      this.deleteSubscriber(event.stream.streamManager);
    });


    this.getToken().then(token => {


      this.session.connect(token, { clientData: this.myUserName })
        .then(() => {


          let publisher: Publisher = this.OV.initPublisher(undefined, {
            audioSource: undefined,
            videoSource: undefined,
            publishAudio: true,
            publishVideo: true,
            resolution: '640x480',
            frameRate: 30,
            insertMode: 'APPEND',
            mirror: false
          });

          // --- 6) Publish your stream ---

          this.session.publish(publisher);

          this.mainStreamManager = publisher;
          this.publisher = publisher;
        })
        .catch(error => {
          console.log('There was an error connecting to the session:', error.code, error.message);
        });
    });
  }

  leaveSession() {



    if (this.session) { this.session.disconnect(); };

    // Empty all properties...
    this.subscribers = [];
    delete this.publisher;
    delete this.session;
    delete this.OV;
    this.generateParticipantInfo();
  }


  private generateParticipantInfo() {

    this.mySessionId = 'SessionA';
    this.myUserName = 'Participant' + Math.floor(Math.random() * 100);
  }

  private deleteSubscriber(streamManager: StreamManager): void {
    let index = this.subscribers.indexOf(streamManager, 0);
    if (index > -1) {
      this.subscribers.splice(index, 1);
    }
  }

  updateMainStreamManager(streamManager: StreamManager) {
    this.mainStreamManager = streamManager;
  }





  getToken(): Promise<string> {
    return this.createSession(this.mySessionId).then(
      sessionId => {
        return this.createToken(sessionId);
      })
  }

  createSession(sessionId) {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ customSessionId: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
          'Content-Type': 'application/json'
        })
      };
      return this.httpClient.post(this.OPENVIDU_SERVER_URL + '/api/sessions', body, options)
        .pipe(
          catchError(error => {
            if (error.status === 409) {
              resolve(sessionId);
            } else {
              console.warn('No connection to OpenVidu Server. This may be a certificate error at ' + this.OPENVIDU_SERVER_URL);
              if (window.confirm('No connection to OpenVidu Server. This may be a certificate error at \"' + this.OPENVIDU_SERVER_URL +
                '\"\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server' +
                'is up and running at "' + this.OPENVIDU_SERVER_URL + '"')) {
                location.assign(this.OPENVIDU_SERVER_URL + '/accept-certificate');
              }
            }
            return observableThrowError(error);
          })
        )
        .subscribe(response => {
          console.log(response);
          resolve(response['id']);
        });
    });
  }

  createToken(sessionId): Promise<string> {
    return new Promise((resolve, reject) => {

      const body = JSON.stringify({ session: sessionId });
      const options = {
        headers: new HttpHeaders({
          'Authorization': 'Basic ' + btoa('OPENVIDUAPP:' + this.OPENVIDU_SERVER_SECRET),
          'Content-Type': 'application/json'
        })
      };
      return this.httpClient.post(this.OPENVIDU_SERVER_URL + '/api/tokens', body, options)
        .pipe(
          catchError(error => {
            reject(error);
            return observableThrowError(error);
          })
        )
        .subscribe(response => {
          console.log(response);
          resolve(response['token']);
        });
    });
  }

}
