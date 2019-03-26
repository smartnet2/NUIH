import { Component, Input } from '@angular/core';
@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.html',
    styleUrls: ['./tree-view.css']
})
export class TreeView {
    @Input() replyList: any;
    parseBody(body) {
        console.log("New body");
        console.log(body);
        if (body.includes('</a>')) {
            return true;
        } else {
            return false;
        }
    }
}