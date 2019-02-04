import { of as observableOf } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Injectable, EventEmitter } from '@angular/core';
import { ConfigService, ServerResponse } from '@sunbird/shared';
import { ContentService, UserService, CoursesService } from '@sunbird/core';
import * as _ from 'lodash';
import * as moment from 'moment';

@Injectable()
export class CourseDiscussionsService {
  /**
 * Reference of content service.
 */
  public contentService: ContentService;

  /**
   * Reference of config service
   */
  public configService: ConfigService;

  public courseProgress: any = {};

  public userService: UserService;

  /**
  * An event emitter to emit course progress data from a service.
  */
  courseProgressData: EventEmitter<any> = new EventEmitter();


  constructor(contentService: ContentService, configService: ConfigService,
    userService: UserService, public coursesService: CoursesService) {
    this.contentService = contentService;
    this.configService = configService;
    this.userService = userService;
  }

  /**
  * method to post discussion thread
  */
  public postDiscussion(req) {
    const contextId = req.contextId;
    let requestBody = {
      "request": {
        "title": req.title,
        "body": req.body,
        "contextId": contextId,
        "contextType": "batch",
        "type": "public",
        "config": {
          "upVote": true,
          "downVote": true,
          "acceptAnswer": true,
          "flag": true
        }
      }
    }
    const channelOptions = {
      url: this.configService.urlConFig.URLS.COURSE.COURSE_DISCUSSIONS_POST,
      data: requestBody
    };
    return this.contentService.post(channelOptions).pipe(map((res: ServerResponse) => {
      return res;
    }), catchError((err) => {
      return err;
    }));

  }


  public retrieveDiscussion(req) {
    const batchId = req;
    console.log("batch Id", batchId)
    let requestBody =
    {
      "request":
      {
        "contextId": batchId,
        "type": "public"
      }
    }
    const channelOptions = {
      url: this.configService.urlConFig.URLS.COURSE.RETRIEVE_DISCUSSION,
      data: requestBody
    };
    return this.contentService.post(channelOptions).pipe(map((res: ServerResponse) => {
      return res;
    }), catchError((err) => {
      return err;
    }));

  }

  public replyToThread(req) {
    const threadId = req.threadId;
    const body = req.body
    let requestBody =
    {
      "request": {
        "threadId": threadId,
        "body": body
      }
    }
    const channelOptions = {
      url: this.configService.urlConFig.URLS.COURSE.REPLY_TO_THREAD,
      data: requestBody
    };
    return this.contentService.post(channelOptions).pipe(map((res: ServerResponse) => {
      return res;
    }), catchError((err) => {
      return err;
    }));

  }

  public getReplies(id) {
    const channelOptions = {
      url: this.configService.urlConFig.URLS.COURSE.RETRIEVE_REPLIES + id
    };
    return this.contentService.get(channelOptions).pipe(map((res: ServerResponse) => {
      return res;
    }), catchError((err) => {
      return err;
    }));

  }

  public likeReply(body) {
    const channelOptions = {
      url: this.configService.urlConFig.URLS.COURSE.LIKE_POST,
      data: body
    };
    return this.contentService.post(channelOptions).pipe(map((res: ServerResponse) => {
      return res;
    }), catchError((err) => {
      return err;
    }));

  }

}