import {Page, NavController, NavParams} from 'ionic-angular';
import {SettingsPage} from '../settings/settings';
import {NewGamePage} from '../newGame/newGame';

@Page({
    templateUrl: 'build/pages/home/home.html'
})

export class HomePage {

    static get parameters() {
        return [[NavController], [NavParams]];
    }

    constructor(nav, navParams) {
        this.nav = nav;
        this.navParams = navParams;
        this.settings = SettingsPage;
        this.newGame = NewGamePage;
    }

    makeNewGame() {
        this.nav.push(NewGamePage, {
            b: "Bahh"
        });
    }

    goToSettings() {
        this.nav.push(SettingsPage);
    }
}
