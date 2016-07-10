import {Page, NavController, NavParams, Storage, SqlStorage} from 'ionic-angular';
import {BarcodeScanner} from 'ionic-native';
import {SettingsPage} from '../settings/settings';
import {NewGamePage} from '../new-game/new-game';
import {SavedCodesPage} from '../saved-codes/saved-codes';
import {ScannedCodesPage} from '../scanned-codes/scanned-codes';

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

        this.storage = new Storage(SqlStorage);

        this.settings = SettingsPage;
        this.newGame = NewGamePage;
        this.savedQRs = SavedCodesPage;
        this.scannedQRs = ScannedCodesPage;
    }

    onPageWillEnter() {
        this.storage.get("hasPitScouting").then(value => {
            this.includePitScouting = (value === "true");
        });
        this.storage.get("isMaster").then(value => {
            this.isMaster = (value === "true");
        });
    }

    makeNewGame() {
        this.nav.push(NewGamePage, {
            b: "Bahh"
        });
    }

    makeNewPitScout() {

    }

    goToSavedCodes() {
        this.nav.push(SavedCodesPage);
    }

    goToScannedCodes() {
        this.nav.push(ScannedCodesPage);
    }

    goToSettings() {
        this.nav.push(SettingsPage);
    }

    scanQR() {
        BarcodeScanner.scan().then(qrData => {
            console.log(this.decode(qrData));
        }, err => {
            console.log(err);
        });
    }

    decode(qrData) {
        return qrData.split(",");
    }
}
