import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fep',
  templateUrl: './fep.component.html',
  styleUrls: ['./fep.component.css']
})
export class FepComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log("In Fep Component")
  }

}
