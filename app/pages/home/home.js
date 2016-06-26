import {Page, NavController, NavParams} from 'ionic-angular';
import {BarcodeScanner} from 'ionic-native';
import {SettingsPage} from '../settings/settings';
import {NewGamePage} from '../new-game/new-game';
import {SavedCodesPage} from '../saved-codes/saved-codes';

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
        this.savedQRs = SavedCodesPage;
    }

    makeNewGame() {
        this.nav.push(NewGamePage, {
            b: "Bahh"
        });
    }

    goToSavedCodes() {
        this.nav.push(SavedCodesPage);
    }

    goToSettings() {
        this.nav.push(SettingsPage);
    }

    scanQR() {
        BarcodeScanner.scan().then(barcodeData => {
            console.log(barcodeData);
        }, err => {
            console.log(err);
        });
    }
}
