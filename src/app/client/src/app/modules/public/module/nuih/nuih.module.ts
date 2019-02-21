import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryModule } from '@sunbird/telemetry';
import { CoreModule } from '@sunbird/core';
import { SharedModule } from '@sunbird/shared';
import { NgInviewModule } from 'angular-inport';
import { NuihComponent } from './components/nuih/nuih.component';
import { LearnComponent } from './components/learn/learn.component';
import { InnovateComponent } from './components/innovate/innovate.component';
import { DataExchangeComponent } from './components/data-exchange/data-exchange.component';
import { SmartGovComponent } from './components/smart-gov/smart-gov.component';
import { AboutusComponent } from './components/about-us/about-us.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { SSLVerifyComponent } from './components/ssl-verify/ssl-verify.component';


@NgModule({
  imports: [
    CommonModule,
    TelemetryModule,
    CoreModule,
    SharedModule,
    NgInviewModule
  ],
  declarations: [NuihComponent, LearnComponent, InnovateComponent, DataExchangeComponent, SmartGovComponent, AboutusComponent, ComingSoonComponent, SSLVerifyComponent]
})
export class NuihModule { }
