import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AuthService } from '../auth.service';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  public name: string;
  public roll: string;
  public hostel: string;
  public gender: string;
  public categorySquash = '';
  public categoryTT = '';
  public categoryTennis = '';
  public categoryBadminton = '';
  public preferred = '';
  public contact: number;
  public pass: string;
  public pass1: string;
  public wrong = false;
  public wrongNumber = false;

  constructor(public authService: AuthService) {}

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.wrongNumber = false;
    let sports = '';
    for (const sport of this.preferred) {
      sports = sport + ',' + sports;
    }
    if (form.value.password !== form.value.pass1) {
      this.wrong = true;
      return;
    }
    if (form.value.contact >= 9999999999 && form.value.contact <= 1000000000) {
      this.wrongNumber = true;
      return;
    }
    this.authService.createUser(
      form.value.name,
      form.value.roll,
      form.value.hostel,
      form.value.gender,
      form.value.categorySquash,
      form.value.categoryTT,
      form.value.categoryTennis,
      form.value.categoryBadminton,
      sports,
      form.value.contact,
      form.value.password
      );
  }
}
