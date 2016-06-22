import {Page, NavParams, Storage, SqlStorage} from 'ionic-angular';

@Page({
    templateUrl: 'build/pages/newGame/newGame.html'
})

export class NewGamePage {
    constructor() {
        this.ranNum = 0;

        this.storage = new Storage(SqlStorage);

        this.storage.get("randNumber").then((info) => {
            this.ranNum = info;
        });
    }
}
