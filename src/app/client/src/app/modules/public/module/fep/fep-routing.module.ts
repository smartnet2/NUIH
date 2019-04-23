import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes } from '@angular/router';

import { RouterModule } from '@angular/router';
import { FepComponent } from './components/fep/fep.component';
import { FaqComponent } from './components/faq/faq.component';
import { AboutComponent } from './components/about/about.component';

const routes: Routes = [
  // {
  //    path: '', data: {
  //     telemetry: {
  //       env: 'fep', pageid: 'fep', uri: '/fep', subtype: 'paginate',
  //       type: 'view'
  //     }
  //   },
  //   component: FepComponent
    
  // }
 


];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class FepRoutingModule { }
