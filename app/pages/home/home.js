import {Page, NavController, NavParams, Alert, Toast, Storage, SqlStorage} from 'ionic-angular';
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

        this.createCodesDb();

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
        this.storage.get("darkscheme").then(value => {
            this.darkscheme = value;
        });
    }

    createCodesDb() {
        this.storage.query("CREATE TABLE IF NOT EXISTS scannedcodes (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT)").then(data => {},
        error => {
            console.log("create error -> " + JSON.stringify(error));
        });
    }

    addCodeToDb(code) {
        this.storage.query("INSERT INTO scannedcodes (code) VALUES ('" + code + "')").then(data => {

        }, error => {
            console.log("insert error -> " + JSON.stringify(error) + " with " + code);
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
        BarcodeScanner.scan().then(result => {
            if(result.cancelled) {
                this.nav.present(Toast.create({
                    message: "Scanning cancelled. No data added.",
                    duration: 1200
                }));
            } else {
                let qrData = result.text;
                if(this.dataService.isValid(qrData)) {
                    let data = this.dataService.decode(qrData);

                    this.addCodeToDb(qrData);

                    this.nav.present(Toast.create({
                        message: "Successfully added team " + data.teamNumber + ".",
                        duration: 900
                    }));
                } else {
                    this.nav.present(Alert.create({
                        title: "Invalid QR Code",
                        subTitle: "QR code gave: '" + qrData + "', which is not a valid ScoutBot code.",
                        buttons: ["Dismiss"]
                    }));
                }
            }
        }, err => {
            console.log(err);
        });
    }
}
