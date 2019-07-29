import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { LadderRanking } from './ladder-table/ladder.model';
import { Challenges } from './challenge-list/challenges.model';
import { Confirmations } from './confirmation/confirm-result/confirmation.model';

@Injectable({providedIn: 'root'})

export class LadderService {

  private ladderTable: LadderRanking[] = [];
  private ladderUpdate = new Subject<LadderRanking[]>();


  private challenges: Challenges[] = [];
  private challengesUpdates = new Subject<Challenges[]>();

  private confirmations: Confirmations[] = [];
  private confirmationsUpdates = new Subject<Confirmations[]>();

  constructor(private http: HttpClient) {}



  getChallenges() {
    this.http.get<Challenges[]>('http://localhost:3000/api/challenges')
     .subscribe((challengeData) => {
      this.challenges =  challengeData;
      this.challengesUpdates.next([...this.challenges]);
     });
  }

  getChallengesUpdateListener() {
    return this.challengesUpdates.asObservable();
  }

  getConfirmations() {
    this.http.get<Confirmations[]>('http://localhost:3000/api/confirmations')
      .subscribe((confirmationData) => {
        this.confirmations = confirmationData;
        this.confirmationsUpdates.next([...this.confirmations]);
      });
  }

  getConfirmationsUpdateListener() {
    return this.confirmationsUpdates.asObservable();
  }

  addChallenge(challenge: Challenges) {
    this.challenges.push(challenge);
    this.challengesUpdates.next([...this.challenges]);
  }

  getLadder(sport: string) {
    this.http.get<LadderRanking[]>('http://localhost:3000/api/table/' + sport)
     .subscribe((ladderData) => {
       this.ladderTable = ladderData;
       this.ladderUpdate.next([...this.ladderTable]);
     });
  }

  getLadderUpdateListener() {
    return this.ladderUpdate.asObservable();
  }

}