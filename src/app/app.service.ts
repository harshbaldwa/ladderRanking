import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { LadderRanking } from './ladder-table/ladder.model';
import { Challenges } from './challenge-list/challenges.model';
import { Match } from './challenge-new/match.model';
import { PreviousMatch } from './previous-match/previous_match.model';
import { Confirmations } from './confirmation/confirm-result/confirmation.model';
import { Router } from '@angular/router';
import { Profile } from 'selenium-webdriver/firefox';
import { MatSnackBar } from '@angular/material';
import { environment } from '../environments/environment';

const BackendURLNotifications = environment.apiUrl + 'notification/';
const BackendURLLadder = environment.apiUrl + 'table/';
const BackendURLChallenge = environment.apiUrl + 'challenge/';
const BackendURLPrevious = environment.apiUrl + 'previous/';
const BackendURLProfile = environment.apiUrl + 'profile/';
const BackendURLConfirmation = environment.apiUrl + 'confirmations/';
const BackendURLSecy = environment.apiUrl + 'secy/';

@Injectable({providedIn: 'root'})

export class LadderService {

  private ladderTable: LadderRanking[] = [];
  private ladderUpdate = new Subject<LadderRanking[]>();

  private sports: string[] = [];
  private sportsUpdate = new Subject<string[]>();

  private challengesN: number;
  private challengesUpdatesN = new Subject<number>();

  private challengesP: number;
  private challengesUpdatesP = new Subject<number>();

  private challengesC: number;
  private challengesUpdatesC = new Subject<number>();


  private challengesR: Challenges[] = [];
  private challengesUpdatesR = new Subject<Challenges[]>();

  private challengesS: Challenges[] = [];
  private challengesUpdatesS = new Subject<Challenges[]>();

  private previousMatches: PreviousMatch[] = [];
  private previousMatchesUpdates = new Subject<PreviousMatch[]>();

  private confirmations: Confirmations[] = [];
  private confirmationsUpdates = new Subject<Confirmations[]>();

  private profileData: Profile;
  private profileUpdate = new Subject<Profile>();

  private squashRankUpdate = new Subject<number>();
  private ttRankUpdate = new Subject<number>();
  private tennisRankUpdate = new Subject<number>();
  private badmintonRankUpdate = new Subject<number>();

  private categoryData: any;
  private categoryUpdate = new Subject<any>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

// Notifications
  getNumber(id: string) {
    this.http.get(BackendURLNotifications + 'challenges/' + id)
      .subscribe((notification) => {
        this.challengesN = Number(notification[0]);
        this.challengesP = Number(notification[1]);
        this.challengesC = Number(notification[2]);
        // tslint:disable: triple-equals
        this.challengesUpdatesN.next(this.challengesN);

        this.challengesUpdatesP.next(this.challengesP);

        this.challengesUpdatesC.next(this.challengesC);

      });
  }

  getChallengesNUpdateListener() {
    return this.challengesUpdatesN.asObservable();
  }

  getChallengesPUpdateListener() {
    return this.challengesUpdatesP.asObservable();
  }

  getChallengesCUpdateListener() {
    return this.challengesUpdatesC.asObservable();
  }

// Getting Sports for user
  getSports(id: string) {
    const myId = { id };
    this.http.post(BackendURLLadder + 'sports/', myId)
      .subscribe((data: string) => {
        if (data && !(data === '')) {
          this.sports = data.split(',');
        }
        this.sportsUpdate.next([...this.sports]);
      });
  }

  getSportsUpdateListener() {
    return this.sportsUpdate.asObservable();
  }

// Getting Ladder from server
  getLadder(sport: string) {
    this.http.get<LadderRanking[]>(BackendURLLadder + sport)
      .subscribe((ladderData) => {
        this.ladderTable = ladderData;
        this.ladderUpdate.next([...this.ladderTable]);
      });
  }

  getLadderUpdateListener() {
    return this.ladderUpdate.asObservable();
  }

// Getting the rank from ladder data
  getSquashRankLadder(id: string) {
    this.http.get<LadderRanking[]>(BackendURLLadder + 'squash')
      .subscribe((ladderData) => {
        const playerRank = ladderData.filter(player => player.id === id);
        if (playerRank.length != 0) {
          this.squashRankUpdate.next(playerRank[0].rank);
        }
      });
  }

  getTTRankLadder(id: string) {
    this.http.get<LadderRanking[]>(BackendURLLadder + 'tt')
      .subscribe((ladderData) => {
        const playerRank = ladderData.filter(player => player.id === id);
        if (playerRank.length != 0) {
          this.ttRankUpdate.next(playerRank[0].rank);
        }
      });
  }

  getTennisRankLadder(id: string) {
    this.http.get<LadderRanking[]>(BackendURLLadder + 'tennis')
      .subscribe((ladderData) => {
        const playerRank = ladderData.filter(player => player.id === id);
        if (playerRank.length != 0) {
          this.tennisRankUpdate.next(playerRank[0].rank);
        }
      });
  }

  getBadmintonRankLadder(id: string) {
    this.http.get<LadderRanking[]>(BackendURLLadder + 'badminton')
      .subscribe((ladderData) => {
        const playerRank = ladderData.filter(player => player.id === id);
        if (playerRank.length != 0) {
          this.badmintonRankUpdate.next(playerRank[0].rank);
        }
      });
  }

  squashRankListener() {
    return this.squashRankUpdate.asObservable();
  }

  ttRankListener() {
    return this.ttRankUpdate.asObservable();
  }

  tennisRankListener() {
    return this.tennisRankUpdate.asObservable();
  }

  badmintonRankListener() {
    return this.badmintonRankUpdate.asObservable();
  }

// Adding a new challenge to the database
  addChallenge(
    p1Id: string,
    p2Id: string,
    p1Name: string,
    p2Name: string,
    sport: string,
    date: string,
    time: string,
    message: string
    ) {
    const match: Match = {
      id: null,
      p1_id: p1Id,
      p2_id: p2Id,
      p1_name: p1Name,
      p2_name: p2Name,
      sport,
      message,
      date,
      time,
      rejected: false
    };
    this.http.post<{}>(BackendURLChallenge + 'addMatch', match)
      .subscribe(() => {
        this.getNumber(p2Id);
        this.openSnackBar('Challenge Sent!', 'OK!');
      });
  }

// Getting challenges sent or received

  getChallengesR(id: string) {
    const myId = { id };
    this.http.post<Challenges[]>(BackendURLChallenge + 'challengesR', myId)
     .subscribe((challengeData) => {
      this.challengesR =  challengeData;
      this.challengesUpdatesR.next([...this.challengesR]);
     });
  }

  getChallengesRUpdateListener() {
    return this.challengesUpdatesR.asObservable();
  }

  getChallengesS(id: string) {
    const myId = { id };
    this.http.post<Challenges[]>(BackendURLChallenge + 'challengesS', myId)
      .subscribe((challengeData) => {
        this.challengesS = challengeData;
        this.challengesUpdatesS.next([...this.challengesS]);
      });
  }

  getChallengesSUpdateListener() {
    return this.challengesUpdatesS.asObservable();
  }

// Accepting Received Challenge
  confirmChallenge(id: string) {
    const myId = { id };
    this.http.post(BackendURLChallenge + 'accept', myId)
      .subscribe((result) => {
        const updatedChallenges = this.challengesR.filter(challenge => challenge._id !== id);
        this.challengesR = updatedChallenges;
        this.getNumber(id);
        this.challengesUpdatesR.next([...this.challengesR]);
      });
  }

// Rejecting Received Challenge
  deleteChallengeR(id: string) {
    this.http.get(BackendURLChallenge + 'removechallengeR/' + id)
      .subscribe(() => {
        const updatedChallenges = this.challengesR.filter(challenge => challenge._id !== id);
        this.challengesR = updatedChallenges;
        this.getNumber(id);
        this.challengesUpdatesR.next([...this.challengesR]);
      });
  }

// Deleting Sent Challenge
  deleteChallengeS(id: string) {
    this.http.delete(BackendURLChallenge + 'removechallengeS/' + id)
      .subscribe(() => {
        const updatedChallenges = this.challengesS.filter(challenge => challenge._id !== id);
        this.challengesS = updatedChallenges;
        this.getNumber(id);
        this.challengesUpdatesS.next([...this.challengesS]);
      });
  }

// Confirming the accepted or rejected challenge
  updateChallenge(id: string) {
    const myId = { id };
    this.http.post(BackendURLChallenge + 'acknowledge', myId)
      .subscribe((result) => {
        const updatedChallenges = this.challengesS.filter(challenge => challenge._id !== id);
        this.challengesS = updatedChallenges;
        this.getNumber(id);
        this.challengesUpdatesS.next([...this.challengesS]);
      });
  }

// Previous Match results
  getPreviousMatchResult(id: string) {
    const myId = { id };
    this.http.post<PreviousMatch[]>(BackendURLPrevious, myId)
      .subscribe((matchData) => {
        this.previousMatches = matchData;
        this.previousMatchesUpdates.next([...this.previousMatches]);
      });
  }

  getPreviousUpdateListener() {
    return this.previousMatchesUpdates.asObservable();
  }

// Updating the score
  updateScore(id: string, matchId: string, matchScore: string, setScore: string) {
    const data = { id, matchId, matchScore, setScore };
    this.http.post(BackendURLPrevious + 'updateScore', data)
      .subscribe((result) => {
      });
  }

// SnackBar after updating result
  updatedResult(router: Router) {
    router.navigate(['/previous']);
    this.openSnackBar('Awaiting Confirmation!', 'OK!');
  }

// Profile Setup
  getProfile(id: string) {
    const data = { id };
    this.http.post<any>(BackendURLProfile, data)
      .subscribe((profileData) => {
        this.profileData = profileData;
        this.profileUpdate.next(this.profileData);
      });
  }

  getProfileUpdateListener() {
    return this.profileUpdate.asObservable();
  }

  changeProfile(
    id: string,
    name: string,
    hostel: string,
    gender: string,
    preferred: string,
    categorySquash: string,
    categoryTT: string,
    categoryTennis: string,
    categoryBadminton: string,
    contact: string
  ) {
    const data = {
      id,
      name,
      hostel,
      gender,
      preferred,
      categorySquash,
      categoryTT,
      categoryTennis,
      categoryBadminton,
      contact
    };
    this.http.post(BackendURLProfile + 'update', data)
      .subscribe(_ => {
        this.openSnackBar('Profile Updated!', 'OK');
      });
  }

// Getting Confirmations
  getConfirmations(id: string) {
    const myId = { id };
    this.http.post<Confirmations[]>(BackendURLConfirmation, myId)
      .subscribe((confirmationData) => {
        this.confirmations = confirmationData;
        this.confirmationsUpdates.next([...this.confirmations]);
      });
  }

  getConfirmationsUpdateListener() {
    return this.confirmationsUpdates.asObservable();
  }

// Rejecting the confirmation
  rejectFinalResult(matchId: string) {
    const data = { matchId };
    this.http.post(BackendURLConfirmation + 'finalReject', data)
      .subscribe(result => {
        const updatedConfirmations = this.confirmations.filter(confirmation => confirmation._id !== matchId);
        this.confirmations = updatedConfirmations;
        this.confirmationsUpdates.next([...this.confirmations]);
        this.openSnackBar('Rejected Confirmation!', 'OK');
      });
  }

// Accepting the confirmation

  setFinalResult(id: string, matchId: string, p1Yes: boolean) {
    const dataSend = { id, matchId, p1Yes };
    this.http.post(BackendURLConfirmation + 'finalResult', dataSend)
        .subscribe(data => {
          const updatedConfirmations = this.confirmations.filter(confirmation => confirmation._id !== matchId);
          this.confirmations = updatedConfirmations;
          this.confirmationsUpdates.next([...this.confirmations]);
          this.openSnackBar('Ranking Updated!', 'OK');
          const dataset = { matchId };
          this.http.post(environment.apiUrl + 'algo', dataset)
            .subscribe((body) => {
            });
        });
  }

// Secy Response
  secy(matchId: string, whichPlayer: string) {
    const dataSend = { matchId, whichPlayer };
    this.http.post(BackendURLSecy, dataSend)
      .subscribe(data => {
        const updatedConfirmations = this.confirmations.filter(confirmation => confirmation._id !== matchId);
        this.confirmations = updatedConfirmations;
        this.confirmationsUpdates.next([...this.confirmations]);
        this.openSnackBar('Matter has been reported. Secy will take the final action!', 'OK');
      });
  }

// Secy Category
  secyCategory(sport: string) {
    this.http.get(BackendURLSecy + 'players/' + sport)
      .subscribe(data => {
        this.categoryData = data;
        this.categoryUpdate.next(this.categoryData);
      });
  }

  secyCategoryUpdateListener() {
    return this.categoryUpdate.asObservable();
  }

// SnackBar for all!
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, { duration: 4000 });
  }

}
