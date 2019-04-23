import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GetComponent } from './components/get/get.component';
import { DialCodeComponent } from './components/dial-code/dial-code.component';
import { PublicFooterComponent } from './components/public-footer/public-footer.component';
import {
  LandingPageComponent, SignupComponent, PublicContentPlayerComponent,
  PublicCollectionPlayerComponent
} from './components';
import { SignupGuard, LandingpageGuard } from './services';
import { NuihComponent, LearnComponent, InnovateComponent, DataExchangeComponent, SmartGovComponent, AboutusComponent, ComingSoonComponent } from './module/nuih';
import { AboutComponent } from './module/fep/components/about/about.component';
import { FaqComponent } from './module/fep/components/faq/faq.component';
import { FepComponent } from './module/fep/components/fep/fep.component';
import { ContactusComponent } from './module/fep/components/contactus/contactus.component';
import { AddInformationComponent } from './module/fep/components/add-information/add-information.component';
import { FepCourseComponent } from './module/fep/components/fep-course/fep-course.component';

const routes: Routes = [
  {
    path: '', // root path '/' for the app
    component: LandingPageComponent,
    canActivate: [LandingpageGuard],
    data: {
      telemetry: {
        env: 'public', pageid: 'landing-page', type: 'edit', subtype: 'paginate'
      }
    }
  },
  {
    path: 'signup', component: SignupComponent,
    canActivate: [SignupGuard],
    data: {
      telemetry: {
        env: 'public', pageid: 'signup', type: 'edit', subtype: 'paginate'
      }
    }
  },
  {
    path: 'get', component: GetComponent, data: {
      telemetry: {
        env: 'public', pageid: 'get', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'get/dial/:dialCode', component: DialCodeComponent, data: {
      telemetry: {
        env: 'public', pageid: 'get-dial', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'play/content/:contentId', component: PublicContentPlayerComponent, data: {
      telemetry: {
        env: 'public', pageid: 'play-content', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'play/collection/:collectionId', component: PublicCollectionPlayerComponent, data: {
      telemetry: {
        env: 'public', pageid: 'play-collection', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'explore', loadChildren: './module/explore/explore.module#ExploreModule'
  },
  {
    path: ':slug/explore', loadChildren: './module/explore/explore.module#ExploreModule'
  },
  {
    path: 'nuis', component: NuihComponent, data: {
      telemetry: {
        env: 'public', pageid: 'nuis', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'lms', component: LearnComponent, data: {
      telemetry: {
        env: 'public', pageid: 'lms', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'innovate', component: InnovateComponent, data: {
      telemetry: {
        env: 'public', pageid: 'innovate', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'iudx', component: DataExchangeComponent, data: {
      telemetry: {
        env: 'public', pageid: 'iudx', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'smartgov', component: SmartGovComponent, data: {
      telemetry: {
        env: 'public', pageid: 'smartgov', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'aboutus', component: AboutusComponent, data: {
      telemetry: {
        env: 'public', pageid: 'aboutus', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'comingsoon', component: ComingSoonComponent, data: {
      telemetry: {
        env: 'public', pageid: 'comingsoon', type: 'view', subtype: 'paginate'
      }
    }
  },
  //For Fep Module

  {
    path: 'fep', component: FepComponent, data: {
      telemetry: {
        env: 'public', pageid: 'fep', type: 'view', subtype: 'paginate'
      }
    }
    },
 
  {
    path: 'about', component: AboutComponent, data: {
      telemetry: {
        env: 'public', pageid: 'about', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'faq', component: FaqComponent, data: {
      telemetry: {
        env: 'public', pageid: 'faq', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'contactus', component: ContactusComponent, data: {
      telemetry: {
        env: 'public', pageid: 'contactus', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'information', component: AddInformationComponent, data: {
      telemetry: {
        env: 'public', pageid: 'information', type: 'view', subtype: 'paginate'
      }
    }
  },
  {
    path: 'fepcourse', component: FepCourseComponent, data: {
      telemetry: {
        env: 'public', pageid: 'fepcourse', type: 'view', subtype: 'paginate'
      }
    }
  }


];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
