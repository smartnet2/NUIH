import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FepRoutingModule } from './fep-routing.module';
import { FepFooterComponent } from './components/fep-footer/fep-footer.component';
import { FepComponent } from './components/fep/fep.component';
import { FepHeaderComponent } from './components/fep-header/fep-header.component';
import { FepHomeHeaderComponent } from './components/fep-home-header/fep-home-header.component';
import { CoreModule } from '../../../core/core.module';
import { SuiModule } from 'ng2-semantic-ui';
import { SharedModule } from '../../../shared';
import { FaqComponent } from './components/faq/faq.component';
import { AboutComponent } from './components/about/about.component';
import { ContactusComponent } from './components/contactus/contactus.component';
import { AddInformationComponent } from './components/add-information/add-information.component';
import { FepCourseComponent } from './components/fep-course/fep-course.component';

@NgModule({
  
  imports: [
    CommonModule,FepRoutingModule,CoreModule,SuiModule,SharedModule
  ],
  exports: [
    FepHeaderComponent,FepHomeHeaderComponent,FepFooterComponent
  ],
  declarations: [ FepComponent, FepFooterComponent, FepHeaderComponent, FepHomeHeaderComponent, FaqComponent, AboutComponent, ContactusComponent, AddInformationComponent, FepCourseComponent]
})
export class FepModule { }
