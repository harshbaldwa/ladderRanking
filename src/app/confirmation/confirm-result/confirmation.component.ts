import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { Confirmations } from './confirmation.model';
import { LadderService } from '../../app.service';

@Component({
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})

export class ConfirmationComponent implements OnInit, OnDestroy {

  public confirmations: Confirmations[] = [];
  public confirmSub: Subscription;
  private refresher: Subscription;
  public id = localStorage.getItem('_id');
  constructor(public ladderService: LadderService) { }

  ngOnInit() {
    this.refresher = timer(0, 5000)
      .subscribe(data => {
        this.ladderService.getConfirmations(this.id);
      });
    this.confirmSub = this.ladderService.getConfirmationsUpdateListener()
      .subscribe((confirmations: Confirmations[]) => {
        this.confirmations = confirmations;
        for (const entry of this.confirmations) {
          entry.set_score = entry.set_score.split(' ').join(' | ');
          if (entry.p1_id === this.id) {
            entry.p1_yes = true;
          } else {
            entry.p1_yes = false;
          }
        }
      });
  }

  rejectFinal(matchId: string) {
    this.ladderService.rejectFinalResult(matchId);
  }

  confirmFinal(matchId: string, p1Yes: boolean) {
    this.ladderService.setFinalResult(this.id, matchId, p1Yes);
  }

  ngOnDestroy() {
    this.confirmSub.unsubscribe();
  }
}
