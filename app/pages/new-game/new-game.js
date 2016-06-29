import {Page, NavController, Alert, Storage, SqlStorage} from 'ionic-angular';

@Page({
    templateUrl: 'build/pages/new-game/new-game.html'
})

export class NewGamePage {
    static get parameters() {
        return [[NavController]];
    }

    constructor(nav) {
        this.nav = nav;
        this.storage = new Storage(SqlStorage);

        this.gameMode = "pre";

        this.storage.get("colorNumber").then((colorNumber) => {
            this.colorNumber = (colorNumber === undefined) ? "Red 1" : colorNumber;
            this.navbarColor = this.colorNumber.split(" ")[0].toLowerCase();
        });

        this.storage.get("scout").then((name) => {
            this.scout = (name === undefined) ? "Scout" : name;
        });

        this.allTeams = [];

        this.teamNumber;

        this.foul = false;
        this.deadBot = false;

        this.defenseA = "Portcullis / Cheval de Frise";
        this.defenseB = "Moat / Ramparts";
        this.defenseC = "Drawbridge / Sally Port";
        this.defenseD = "Rock Wall / Rough Terrain";

        this.autonomousDefense = "N";

        this.autonomousSuccessful = false;
    }

    loadTeamsFromDb() {
        this.storage.query("CREATE TABLE IF NOT EXISTS eventteams (number INTEGER PRIMARY KEY, nickname TEXT, website TEXT)").then(data => {}, error => {
            console.log("create error -> " + JSON.stringify(error.err));
        });

        this.storage.query("SELECT * FROM eventteams").then(data => {
            if(data.res.rows.length > 0) {
                for(let i = 0; i < data.res.rows.length; i++) {
                    this.allTeams.push({
                        number: data.res.rows.item(i).number,
                        name: unescape(data.res.rows.item(i).nickname),
                        website: decodeURIComponent(data.res.rows.item(i).website)
                    });
                }
                document.getElementById("addChangeEvent").innerHTML = "Change event";
            }
        }, error => {
            console.log("select error -> " + JSON.stringify(error.err));
        });
    }

    makeQR() {
        if(this.defenseA === "Portcullis / Cheval de Frise") {
            return this.notFilledOutError("Defense A", "Pregame");
        } if(this.defenseB === "Moat / Ramparts") {
            return this.notFilledOutError("Defense B", "Pregame");
        } if(this.defenseC === "Drawbridge / Sally Port") {
            return this.notFilledOutError("Defense C", "Pregame");
        } if(this.defenseD === "Rock Wall / Rough Terrain") {
            return this.notFilledOutError("Defense D", "Pregame");
        }
        qr.canvas({
            canvas: document.getElementById("qrCode"),
            value: this.getText()
        });
    }

    notFilledOutError(fieldUnfilled, section) {
        let message = "You have not filled out the field <b>" + fieldUnfilled + "</b>. in the <b>" + section + "</b> section.";

        let alert = Alert.create({
            title: "Incomplete section",
            subTitle: message,
            buttons: ["Dismiss"]
        });

        this.nav.present(alert);
    }

    getText() {

        let scoutInfo = {
            color: this.colorNumber[0] === "R" ? 0 : 3,
            number: +this.colorNumber.slice(-1),
            name: this.scout
        };

        let defenseA = this.defenseA === "Portcullis" ? 0 : 1;
        let defenseB = this.defenseB === "Moat" ? 0 : 1;
        let defenseC = this.defenseC === "Drawbridge" ? 0 : 1;
        let defenseD = this.defenseD === "Rock Wall" ? 0 : 1;

        let stuff = [
            scoutInfo.color + scoutInfo.number,
            scoutInfo.name,
            defenseA,
            defenseB,
            defenseC,
            defenseD
        ];
        console.log(stuff.join(","));
        return stuff.join(",");
    }
}
