import {Page, NavController, Storage, SqlStorage} from 'ionic-angular';

@Page({
    templateUrl: 'build/pages/saved-codes/saved-codes.html',
})

export class SavedCodesPage {
    static get parameters() {
        return [[NavController]];
    }

    constructor(nav) {
        this.nav = nav;
    }
}
