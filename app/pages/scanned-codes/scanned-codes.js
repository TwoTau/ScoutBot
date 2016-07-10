import {Page, NavController, Storage, SqlStorage} from 'ionic-angular';

@Page({
    templateUrl: 'build/pages/scanned-codes/scanned-codes.html',
})

export class ScannedCodesPage {
    static get parameters() {
        return [[NavController]];
    }

    constructor(nav) {
        this.nav = nav;
    }
}
