import {Page, NavController, NavParams} from 'ionic-angular';
import {SettingsPage} from '../settings/settings';

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
    }

    goToSettings() {
        this.nav.push(SettingsPage, {
            a: "Ahh"
        });
    }
}
