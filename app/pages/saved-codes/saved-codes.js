import {Page, NavController, Alert, Storage, SqlStorage} from 'ionic-angular';
import {GameDataService} from '../../providers/game-data-service/game-data-service';

@Page({
    templateUrl: 'build/pages/saved-codes/saved-codes.html',
    providers: [GameDataService]
})

export class SavedCodesPage {
    static get parameters() {
        return [[NavController], [GameDataService]];
    }

    constructor(nav, dataService) {
        this.nav = nav;
        this.dataService = dataService;

        this.storage = new Storage(SqlStorage);

        this.allTeams = [];
        this.loadTeamsFromDb();

        this.data = [];
        this.getCodesFromDb();
    }

    getCodesFromDb() {
        this.storage.query("SELECT * FROM savedcodes").then(data => {
            let numCodes = data.res.rows.length;
            if(numCodes > 0) {
                for(let i = 0; i < numCodes; i++) {
                    let code = data.res.rows.item(i).code;

                    let decodedData = this.dataService.decode(code);

                    decodedData.savedId = data.res.rows.item(i).id;
                    decodedData.code = code;
                    this.data.push(decodedData);
                }
            }
        }, error => {
            console.log("select error -> " + JSON.stringify(error));
        });
    }

    unescape(escapedName) {
        return escapedName.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39/g, "'");
    }

    loadTeamsFromDb() {
        this.storage.query("SELECT * FROM eventteams").then(data => {
            let numTeams = data.res.rows.length;
            if(numTeams > 0) {
                for(let i = 0; i < numTeams; i++) {
                    let team = data.res.rows.item(i);
                    this.allTeams.push({
                        number: team.number,
                        name: this.unescape(team.nickname)
                    });
                }
            }
        }, error => {
            console.log("select error -> " + JSON.stringify(error.err));
        });
    }

    teamNumberToName(teamNumber) {
        let team = this.allTeams.find(team => team.number === teamNumber);
        return team !== undefined ? team.name : "???";
    }

    viewMore(savedId) {
        let qrElement = document.getElementById("qrCode");
        let qrCodeText = this.data.find(team => team.savedId === savedId).originalEncoded;
        qr.canvas({
            canvas: qrElement,
            value: qrCodeText
        });
        qrElement.style.display = "block";
        // this.nav.present(Alert.create({
        //     title: "View more",
        //     subTitle: "This doesn't do anything.",
        //     buttons: ["Dismiss"]
        // }));
    }

    editStats(savedId) {
        this.nav.present(Alert.create({
            title: "View stats",
            subTitle: "This doesn't do anything.",
            buttons: ["Dismiss"]
        }));
    }

    delete(savedId) {
        this.storage.query("DELETE FROM savedcodes WHERE id = " + savedId).then(data => {
            console.log("yay deleted " + savedId + " successfully.");
            this.data.splice(this.data.indexOf(this.data.find(team => team.savedId === savedId)), 1);
        }, error => {
            console.log("delete error -> " + JSON.stringify(error.err));
        });
    }
}
