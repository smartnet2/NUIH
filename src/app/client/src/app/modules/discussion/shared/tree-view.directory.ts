import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.html',
    styleUrls: ['./tree-view.css']
})
export class TreeView implements OnChanges {
    @Input() replyList: any;
    @Output() getPostNumberfromDirective = new EventEmitter();
    public postNumber: number;
    ngOnChanges() { }
    parseBody(body) {
        if (body.includes('</a>')) {
            return true;
        } else {
            return false;
        }
    }
    getPostNumber(postNumber) {
        this.postNumber = postNumber;
        console.log("Post Number from Directive", this.postNumber);
        this.getPostNumberfromDirective.emit(this.postNumber);
    }
}