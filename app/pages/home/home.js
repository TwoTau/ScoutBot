import {Page, NavController, NavParams, Storage, SqlStorage} from 'ionic-angular';
import {BarcodeScanner} from 'ionic-native';
import {SettingsPage} from '../settings/settings';
import {NewGamePage} from '../new-game/new-game';
import {SavedCodesPage} from '../saved-codes/saved-codes';
import {ScannedCodesPage} from '../scanned-codes/scanned-codes';
import {NewPitScoutPage} from '../new-pit-scout/new-pit-scout';
import {GameDataService} from '../../providers/game-data-service/game-data-service';

@Page({
    templateUrl: 'build/pages/home/home.html',
    providers: [GameDataService]
})

export class HomePage {
    static get parameters() {
        return [[NavController], [NavParams], [GameDataService]];
    }

    constructor(nav, navParams, dataService) {
        this.nav = nav;
        this.navParams = navParams;

        this.dataService = dataService;

        this.storage = new Storage(SqlStorage);

        this.stuff = ":(";

        this.settings = SettingsPage;
        this.newGame = NewGamePage;
        this.newPitScout = NewPitScoutPage;
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
        this.nav.push(NewGamePage);
    }

    makeNewPitScout() {
        this.nav.push(NewPitScoutPage);
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
            let message = JSON.stringify(this.dataService.decode(qrData.text));

            this.stuff = message;
        }, err => {
            console.log(err);
        });
    }
}
