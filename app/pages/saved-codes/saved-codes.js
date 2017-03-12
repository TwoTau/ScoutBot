import {Page, NavController, Storage, SqlStorage} from 'ionic-angular';
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

                    decodedData.scannedId = data.res.rows.item(i).id;
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
        this.storage.query("CREATE TABLE IF NOT EXISTS eventteams (number INTEGER PRIMARY KEY, nickname TEXT, website TEXT)").then(data => {}, error => {
            console.log("create error -> " + JSON.stringify(error.err));
        });

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
}
