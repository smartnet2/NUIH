import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.css']
})
export class ContactusComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onClickAlert(value)
	{
    //alert("Thank you for your interest.Uday-Fintech education platform pilot has been closed and would be up for fresh registrations soon.");
    if(value=='login'){
      window.open('https://www.fintecheducation.com/learn','_self');
    }
    if(value=='register'){
      window.open('https://www.fintecheducation.com/signup','_self');
    }
    
	}
}
