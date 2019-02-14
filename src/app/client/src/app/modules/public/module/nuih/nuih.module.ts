import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryModule } from '@sunbird/telemetry';
import { CoreModule } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { NgInviewModule } from 'angular-inport';
import { NuihComponent } from './components/nuih/nuih.component';
import { LearnComponent } from './components/learn/learn.component';
import { InnovateComponent } from './components/innovate/innovate.component';


@NgModule({
  imports: [
    CommonModule,
    TelemetryModule,
    CoreModule,
    SharedModule,
    NgInviewModule
  ],
  declarations: [NuihComponent, LearnComponent, InnovateComponent]
})
export class NuihModule { }
