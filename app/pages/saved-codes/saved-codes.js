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
        this.data = [
            {teamNumber: 2976, teamName: "Spartabots", scout: "Vishal"},
            {teamNumber: 1331, teamName: "lsdjlkasd", scout: "CommonName"},
            {teamNumber: Math.floor(Math.random()*4000+200), teamName: "Descrubs", scout: "Bobbert"}
        ];

        this.storage = new Storage(SqlStorage);
    }



}
